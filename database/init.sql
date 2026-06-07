CREATE TABLE IF NOT EXISTS operation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO operation_records (module_name, owner_name, status, metric)
VALUES ('营位GIS地图可视化', '运营组', 'ready', '100%');

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  level VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  stay_count INT NOT NULL DEFAULT 0,
  discount_rate DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_level (level)
);

INSERT INTO members (name, phone, level, stay_count, discount_rate) VALUES
('张三', '13800138001', 'NORMAL', 2, 1.00),
('李四', '13800138002', 'SILVER', 5, 0.90),
('王五', '13800138003', 'GOLD', 12, 0.80);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NULL,
  guest_name VARCHAR(80) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  site_type VARCHAR(40) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_rate DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  final_price DECIMAL(10,2) NOT NULL,
  member_level VARCHAR(20) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_guest_phone (guest_phone),
  INDEX idx_checkin_date (checkin_date)
);
