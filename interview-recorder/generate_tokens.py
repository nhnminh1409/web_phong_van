# generate_tokens.py - CHẠY RIÊNG ĐỂ TẠO TOKEN CHO ỨNG VIÊN
import os
import json
import uuid
import pandas as pd
from datetime import date

# === CÀI ĐẶT Ở ĐÂY ===
EXCEL_FILE = 'interviewee.xlsx'        # đổi tên nếu bạn muốn
EXCEL_COLUMN = 'Name'                     # tên cột chứa họ tên
TOKEN_LENGTH = 12                         # độ dài token (10-16 là đẹp)
TOKENS_FILE = 'tokens.json'               # file lưu toàn bộ token
OUTPUT_FOLDER = f"Candidates_{date.today()}"   # thư mục sẽ tạo

def generate_tokens():
    if not os.path.exists(EXCEL_FILE):
        print(f"Không tìm thấy file: {EXCEL_FILE}")
        print("   → Đặt file Excel vào cùng thư mục và chạy lại")
        return

    # Đọc Excel
    try:
        df = pd.read_excel(EXCEL_FILE)
        if EXCEL_COLUMN not in df.columns:
            print(f"Lỗi: Không tìm thấy cột '{EXCEL_COLUMN}' trong file Excel")
            print(f"   Các cột hiện có: {list(df.columns)}")
            return
    except Exception as e:
        print(f"Lỗi đọc file Excel: {e}")
        return

    # Load token cũ (nếu có)
    token_to_name = {}
    if os.path.exists(TOKENS_FILE):
        try:
            with open(TOKENS_FILE, 'r', encoding='utf-8') as f:
                token_to_name = json.load(f)
            print(f"Đã load {len(token_to_name)} token cũ")
        except:
            token_to_name = {}

    # Tạo token mới cho những người chưa có
    new_candidates = []
    for raw_name in df[EXCEL_COLUMN].dropna():
        name = str(raw_name).strip()
        if not name or name.lower() == 'nan':
            continue
        if name not in token_to_name.values():
            token = uuid.uuid4().hex[:TOKEN_LENGTH].upper()
            token_to_name[token] = name
            new_candidates.append({'Name': name, 'Token': token})

    if not new_candidates:
        print("Tất cả ứng viên đã có token rồi!")
        return

    # Tạo thư mục kết quả
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    # Lưu CSV đẹp cho admin
    new_df = pd.DataFrame(new_candidates)
    csv_path = os.path.join(OUTPUT_FOLDER, 'interviewee_tokens.csv')
    new_df.to_csv(csv_path, index=False, encoding='utf-8-sig')

    # Backup tokens.json
    backup_path = os.path.join(OUTPUT_FOLDER, 'tokens_backup.json')
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(token_to_name, f, ensure_ascii=False, indent=2)

    # Cập nhật file tokens.json chính
    with open(TOKENS_FILE, 'w', encoding='utf-8') as f:
        json.dump(token_to_name, f, ensure_ascii=False, indent=2)

    print("\nHOÀN TẤT TẠO TOKEN!")
    print(f"   • Tạo mới: {len(new_candidates)} ứng viên")
    print(f"   • Thư mục: {OUTPUT_FOLDER}")
    print(f"   • File CSV: {csv_path}")
    print(f"   • Tổng cộng: {len(token_to_name)} token đang có hiệu lực\n")

if __name__ == '__main__':
    generate_tokens()
    input("Nhấn Enter để thoát...")