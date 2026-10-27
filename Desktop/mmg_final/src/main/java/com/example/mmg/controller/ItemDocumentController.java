package com.example.mmg.controller;

import com.example.mmg.dto.ItemDocumentDto;
import com.example.mmg.dto.ItemDocumentsResponse;
import com.example.mmg.entity.Item;
import com.example.mmg.entity.ItemDocument;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemDocumentRepository;
import com.example.mmg.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Transactional
public class ItemDocumentController {

    private final ItemRepository itemRepository;
    private final ItemDocumentRepository documentRepository;
    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    @GetMapping("/{itemId}/documents")
    public ResponseEntity<ItemDocumentsResponse> listDocuments(
            @PathVariable Long itemId,
            @AuthenticationPrincipal User currentUser
    ) {
        Item item = accessItem(itemId, currentUser);
        Permissions permissions = permissions(item, currentUser);
        List<ItemDocument> storedDocuments = new ArrayList<>(documentRepository.findByItem_IdOrderByCreatedAtDesc(itemId));

        // Import an older single attachment into the document register once, so it can also
        // have remarks edited and follow the same permissions as newer attachments.
        String legacyPath = item.getDocumentPath();
        boolean representedByRegister = legacyPath != null && storedDocuments.stream()
                .anyMatch(doc -> legacyPath.equals(doc.getStoredPath()));
        if (legacyPath != null && !representedByRegister) {
            File legacyFile = new File(legacyPath);
            if (legacyFile.isFile()) {
                ItemDocument legacyDocument = new ItemDocument();
                legacyDocument.setItem(item);
                legacyDocument.setOriginalFilename(safeOriginalFilename(legacyFile.getName()));
                legacyDocument.setStoredPath(legacyPath);
                legacyDocument.setRemarks("Imported from the existing item attachment.");
                legacyDocument.setUploadedBy(item.getUploadedBy());
                storedDocuments.add(0, documentRepository.save(legacyDocument));
            }
        }
        List<ItemDocumentDto> documents = new ArrayList<>();
        storedDocuments.stream().map(ItemDocumentDto::fromEntity).forEach(documents::add);
        return ResponseEntity.ok(new ItemDocumentsResponse(
                documents, permissions.canEdit(), permissions.canEdit(), permissions.canDelete()
        ));
    }

    @PostMapping(value = "/{itemId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDocumentsResponse> uploadDocuments(
            @PathVariable Long itemId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "remarks", required = false) List<String> remarks,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        Item item = accessItem(itemId, currentUser);
        requireDocumentEdit(item, currentUser);
        if (files == null || files.stream().noneMatch(file -> file != null && !file.isEmpty())) {
            throw new IllegalArgumentException("Select at least one file to upload");
        }

        for (int index = 0; index < files.size(); index++) {
            MultipartFile file = files.get(index);
            if (file == null || file.isEmpty()) continue;
            String originalFilename = safeOriginalFilename(file.getOriginalFilename());
            String storedPath = storeFile(file);
            ItemDocument document = new ItemDocument();
            document.setItem(item);
            document.setOriginalFilename(originalFilename);
            document.setStoredPath(storedPath);
            document.setRemarks(remarks != null && index < remarks.size() ? trimRemarks(remarks.get(index)) : null);
            document.setUploadedBy(currentUser);
            documentRepository.save(document);
            if (item.getDocumentPath() == null) {
                item.setDocumentPath(storedPath);
                itemRepository.save(item);
            }
        }

        return ResponseEntity.ok(listDocuments(itemId, currentUser).getBody());
    }

    @PutMapping(value = "/{itemId}/documents/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDocumentsResponse> updateDocument(
            @PathVariable Long itemId,
            @PathVariable Long documentId,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "file", required = false) MultipartFile replacementFile,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        Item item = accessItem(itemId, currentUser);
        requireDocumentEdit(item, currentUser);
        ItemDocument document = documentRepository.findByIdAndItem_Id(documentId, itemId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (remarks != null) document.setRemarks(trimRemarks(remarks));
        document.setUpdatedBy(currentUser);
        if (replacementFile != null && !replacementFile.isEmpty()) {
            String previousPath = document.getStoredPath();
            String replacementPath = storeFile(replacementFile);
            document.setStoredPath(replacementPath);
            document.setOriginalFilename(safeOriginalFilename(replacementFile.getOriginalFilename()));
            documentRepository.save(document);
            if (previousPath.equals(item.getDocumentPath())) {
                item.setDocumentPath(replacementPath);
                itemRepository.save(item);
            }
            try { Files.deleteIfExists(Paths.get(previousPath)); } catch (IOException ignored) { }
        } else {
            documentRepository.save(document);
        }
        return ResponseEntity.ok(listDocuments(itemId, currentUser).getBody());
    }

    @DeleteMapping("/{itemId}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long itemId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        Item item = accessItem(itemId, currentUser);
        if (!permissions(item, currentUser).canDelete()) {
            throw new SecurityException("Your role cannot delete item documents");
        }
        ItemDocument document = documentRepository.findByIdAndItem_Id(documentId, itemId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        String storedPath = document.getStoredPath();
        documentRepository.delete(document);
        if (storedPath != null && storedPath.equals(item.getDocumentPath())) {
            String fallbackPath = documentRepository.findByItem_IdOrderByCreatedAtDesc(itemId).stream()
                    .map(ItemDocument::getStoredPath)
                    .filter(path -> path != null && Files.isRegularFile(Paths.get(path)))
                    .findFirst().orElse(null);
            item.setDocumentPath(fallbackPath);
            itemRepository.save(item);
        }
        if (storedPath != null) {
            try { Files.deleteIfExists(Paths.get(storedPath)); } catch (IOException ignored) { }
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{itemId}/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadRegisteredDocument(
            @PathVariable Long itemId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal User currentUser
    ) {
        accessItem(itemId, currentUser);
        ItemDocument document = documentRepository.findByIdAndItem_Id(documentId, itemId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        return fileResponse(document.getStoredPath(), document.getOriginalFilename());
    }

    /** Backward-compatible route for the original single-attachment field. */
    @GetMapping("/{itemId}/document")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long itemId,
            @AuthenticationPrincipal User currentUser
    ) {
        Item item = accessItem(itemId, currentUser);
        if (item.getDocumentPath() == null) {
            throw new IllegalArgumentException("No document attached to this item");
        }
        File file = new File(item.getDocumentPath());
        return fileResponse(file.getPath(), file.getName());
    }

    private ResponseEntity<Resource> fileResponse(String path, String downloadName) {
        if (path == null) throw new IllegalArgumentException("No document attached to this item");
        File file = new File(path);
        if (!file.isFile()) throw new IllegalArgumentException("Document file is missing on the server");
        Resource resource = new FileSystemResource(file);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(safeOriginalFilename(downloadName), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private Item accessItem(Long itemId, User currentUser) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        Permissions permission = permissions(item, currentUser);
        if (!permission.canView()) throw new SecurityException("You do not have access to this item's documents");
        return item;
    }

    private void requireDocumentEdit(Item item, User currentUser) {
        if (!permissions(item, currentUser).canEdit()) {
            throw new SecurityException("Your role cannot add or edit documents for this item");
        }
    }

    private Permissions permissions(Item item, User user) {
        String role = user != null && user.getRole() != null ? user.getRole().getName() : "";
        boolean executive = role.equalsIgnoreCase("JS_ADMIN") || role.equalsIgnoreCase("DIRECTOR_ADMIN");
        boolean admin = role.equalsIgnoreCase("ADMIN");
        boolean assignedEmployee = role.equalsIgnoreCase("EMPLOYEE")
                && item.getAssignedEmployee() != null
                && item.getAssignedEmployee().getId().equals(user.getId());
        boolean adminOwnsItem = admin && (item.getAssignedEmployee() == null
                || (item.getAssignedEmployee().getAssignedAdmin() != null
                && item.getAssignedEmployee().getAssignedAdmin().getId().equals(user.getId())));
        boolean canView = executive || adminOwnsItem || assignedEmployee;
        boolean canEdit = canView;
        boolean canDelete = executive || adminOwnsItem;
        return new Permissions(canView, canEdit, canDelete);
    }

    private String storeFile(MultipartFile file) throws IOException {
        Files.createDirectories(UPLOAD_DIR);
        String originalFilename = safeOriginalFilename(file.getOriginalFilename());
        int dot = originalFilename.lastIndexOf('.');
        String extension = dot >= 0 ? originalFilename.substring(dot) : "";
        Path target = UPLOAD_DIR.resolve(UUID.randomUUID() + extension).normalize();
        if (!target.startsWith(UPLOAD_DIR)) throw new SecurityException("Invalid upload filename");
        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, target);
        }
        return target.toString();
    }

    private String safeOriginalFilename(String filename) {
        String cleaned = StringUtils.cleanPath(filename == null ? "document" : filename).replace("\\", "/");
        int slash = cleaned.lastIndexOf('/');
        if (slash >= 0) cleaned = cleaned.substring(slash + 1);
        cleaned = cleaned.replaceAll("[\\r\\n\\\"]", "_").trim();
        if (cleaned.isBlank()) cleaned = "document";
        return cleaned.length() > 255 ? cleaned.substring(cleaned.length() - 255) : cleaned;
    }

    private String trimRemarks(String remarks) {
        if (remarks == null) return null;
        String trimmed = remarks.trim();
        if (trimmed.length() > 2000) throw new IllegalArgumentException("Remarks must be 2000 characters or fewer");
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record Permissions(boolean canView, boolean canEdit, boolean canDelete) { }
}
