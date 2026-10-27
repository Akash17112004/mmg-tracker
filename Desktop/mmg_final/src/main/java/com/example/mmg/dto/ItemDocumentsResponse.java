package com.example.mmg.dto;

import java.util.List;

public record ItemDocumentsResponse(
        List<ItemDocumentDto> documents,
        boolean canUpload,
        boolean canEdit,
        boolean canDelete
) {
}
