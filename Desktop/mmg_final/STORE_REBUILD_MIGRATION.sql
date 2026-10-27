-- MMG Tracker Store rebuild migration
-- Run after selecting the mmg_tracker database.

INSERT IGNORE INTO roles(name) VALUES ('JS_ADMIN'), ('DIRECTOR_ADMIN'), ('ADMIN'), ('EMPLOYEE'), ('OIC_STORE'), ('BILLING');

-- Replace legacy executive and vendor access roles. Vendor accounts are retained as employee accounts.
UPDATE users SET role_id = (SELECT id FROM roles WHERE name='JS_ADMIN') WHERE role_id = (SELECT id FROM roles WHERE name='SUPER_ADMIN');
UPDATE users SET role_id = (SELECT id FROM roles WHERE name='EMPLOYEE') WHERE role_id = (SELECT id FROM roles WHERE name='VENDOR');
UPDATE users SET role_id = (SELECT id FROM roles WHERE name='BILLING') WHERE role_id = (SELECT id FROM roles WHERE name='STORE');
DELETE FROM roles WHERE name IN ('SUPER_ADMIN', 'VENDOR', 'STORE');

-- Existing legacy STORE accounts are preserved as Billing accounts.
UPDATE users SET role_id = (SELECT id FROM roles WHERE name='BILLING') WHERE role_id = (SELECT id FROM roles WHERE name='STORE');

CREATE TABLE IF NOT EXISTS store_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS store_category_fields (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_category_id BIGINT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_store_category_field_category FOREIGN KEY (store_category_id) REFERENCES store_categories(id) ON DELETE CASCADE
);

INSERT INTO store_category_fields (store_category_id, field_name, display_order)
SELECT c.id, 'Serial number', 0 FROM store_categories c
WHERE NOT EXISTS (SELECT 1 FROM store_category_fields f WHERE f.store_category_id = c.id);
INSERT INTO store_category_fields (store_category_id, field_name, display_order)
SELECT c.id, 'Specification', 1 FROM store_categories c
WHERE NOT EXISTS (SELECT 1 FROM store_category_fields f WHERE f.store_category_id = c.id AND f.field_name = 'Specification');
INSERT INTO store_category_fields (store_category_id, field_name, display_order)
SELECT c.id, 'Remarks', 2 FROM store_categories c
WHERE NOT EXISTS (SELECT 1 FROM store_category_fields f WHERE f.store_category_id = c.id AND f.field_name = 'Remarks');

CREATE TABLE IF NOT EXISTS store_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  store_category_id BIGINT NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_store_item_category FOREIGN KEY (store_category_id) REFERENCES store_categories(id),
  CONSTRAINT uq_store_item_category_name UNIQUE (store_category_id, name)
);

CREATE TABLE IF NOT EXISTS store_units (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS store_ledger_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entry_date DATE NOT NULL,
  store_item_id BIGINT NOT NULL,
  vendor_name VARCHAR(200) NULL,
  user_unit_name VARCHAR(200) NULL,
  voucher_no VARCHAR(100) NULL,
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  receipt INT NOT NULL DEFAULT 0,
  issue INT NOT NULL DEFAULT 0,
  balance_qty INT NOT NULL DEFAULT 0,
  balance_value DECIMAL(16,2) NOT NULL DEFAULT 0,
  remarks VARCHAR(500) NULL,
  created_by_id BIGINT NULL,
  created_at DATETIME NULL,
  CONSTRAINT fk_store_ledger_item FOREIGN KEY (store_item_id) REFERENCES store_items(id),
  CONSTRAINT fk_store_ledger_user FOREIGN KEY (created_by_id) REFERENCES users(id),
  INDEX idx_store_ledger_item_date (store_item_id, entry_date, id)
);

CREATE TABLE IF NOT EXISTS store_demands (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_item_id BIGINT NULL,
  custom_item_name VARCHAR(200) NULL,
  quantity INT NOT NULL,
  user_unit_name VARCHAR(200) NOT NULL,
  purpose VARCHAR(500) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  requested_by_id BIGINT NOT NULL,
  requested_at DATETIME NULL,
  fulfilled_qty INT NOT NULL DEFAULT 0,
  store_remarks VARCHAR(500) NULL,
  CONSTRAINT fk_store_demand_item FOREIGN KEY (store_item_id) REFERENCES store_items(id),
  CONSTRAINT fk_store_demand_user FOREIGN KEY (requested_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS store_correction_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ledger_entry_id BIGINT NOT NULL,
  raised_by_id BIGINT NOT NULL,
  reason VARCHAR(1000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  corrected_receipt INT NULL,
  corrected_issue INT NULL,
  corrected_unit_price DECIMAL(14,2) NULL,
  corrected_vendor_name VARCHAR(200) NULL,
  corrected_user_unit_name VARCHAR(200) NULL,
  corrected_voucher_no VARCHAR(100) NULL,
  oic_remarks VARCHAR(1000) NULL,
  reviewed_by_id BIGINT NULL,
  created_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  applied_at DATETIME NULL,
  CONSTRAINT fk_store_correction_ledger FOREIGN KEY (ledger_entry_id) REFERENCES store_ledger_entries(id),
  CONSTRAINT fk_store_correction_raised_by FOREIGN KEY (raised_by_id) REFERENCES users(id),
  CONSTRAINT fk_store_correction_reviewed_by FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);
