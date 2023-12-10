import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThaiProvince1702208953006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (1, 'กรุงเทพมหานคร', 'Bangkok');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (2, 'สมุทรปราการ', 'Samut Prakan');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (3, 'นนทบุรี', 'Nonthaburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (4, 'ปทุมธานี', 'Pathum Thani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (5, 'พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (6, 'อ่างทอง', 'Ang Thong');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (7, 'ลพบุรี', 'Loburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (8, 'สิงห์บุรี', 'Sing Buri');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (9, 'ชัยนาท', 'Chai Nat');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (10, 'สระบุรี', 'Saraburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (11, 'ชลบุรี', 'Chon Buri');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (12, 'ระยอง', 'Rayong');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (13, 'จันทบุรี', 'Chanthaburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (14, 'ตราด', 'Trat');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (15, 'ฉะเชิงเทรา', 'Chachoengsao');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (16, 'ปราจีนบุรี', 'Prachin Buri');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (17, 'นครนายก', 'Nakhon Nayok');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (18, 'สระแก้ว', 'Sa Kaeo');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (19, 'นครราชสีมา', 'Nakhon Ratchasima');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (20, 'บุรีรัมย์', 'Buri Ram');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (21, 'สุรินทร์', 'Surin');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (22, 'ศรีสะเกษ', 'Si Sa Ket');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (23, 'อุบลราชธานี', 'Ubon Ratchathani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (24, 'ยโสธร', 'Yasothon');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (25, 'ชัยภูมิ', 'Chaiyaphum');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (26, 'อำนาจเจริญ', 'Amnat Charoen');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (27, 'หนองบัวลำภู', 'Nong Bua Lam Phu');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (28, 'ขอนแก่น', 'Khon Kaen');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (29, 'อุดรธานี', 'Udon Thani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (30, 'เลย', 'Loei');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (31, 'หนองคาย', 'Nong Khai');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (32, 'มหาสารคาม', 'Maha Sarakham');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (33, 'ร้อยเอ็ด', 'Roi Et');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (34, 'กาฬสินธุ์', 'Kalasin');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (35, 'สกลนคร', 'Sakon Nakhon');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (36, 'นครพนม', 'Nakhon Phanom');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (37, 'มุกดาหาร', 'Mukdahan');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (38, 'เชียงใหม่', 'Chiang Mai');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (39, 'ลำพูน', 'Lamphun');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (40, 'ลำปาง', 'Lampang');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (41, 'อุตรดิตถ์', 'Uttaradit');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (42, 'แพร่', 'Phrae');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (43, 'น่าน', 'Nan');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (44, 'พะเยา', 'Phayao');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (45, 'เชียงราย', 'Chiang Rai');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (46, 'แม่ฮ่องสอน', 'Mae Hong Son');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (47, 'นครสวรรค์', 'Nakhon Sawan');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (48, 'อุทัยธานี', 'Uthai Thani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (49, 'กำแพงเพชร', 'Kamphaeng Phet');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (50, 'ตาก', 'Tak');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (51, 'สุโขทัย', 'Sukhothai');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (52, 'พิษณุโลก', 'Phitsanulok');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (53, 'พิจิตร', 'Phichit');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (54, 'เพชรบูรณ์', 'Phetchabun');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (55, 'ราชบุรี', 'Ratchaburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (56, 'กาญจนบุรี', 'Kanchanaburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (57, 'สุพรรณบุรี', 'Suphan Buri');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (58, 'นครปฐม', 'Nakhon Pathom');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (59, 'สมุทรสาคร', 'Samut Sakhon');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (60, 'สมุทรสงคราม', 'Samut Songkhram');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (61, 'เพชรบุรี', 'Phetchaburi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (62, 'ประจวบคีรีขันธ์', 'Prachuap Khiri Khan');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (63, 'นครศรีธรรมราช', 'Nakhon Si Thammarat');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (64, 'กระบี่', 'Krabi');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (65, 'พังงา', 'Phangnga');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (66, 'ภูเก็ต', 'Phuket');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (67, 'สุราษฎร์ธานี', 'Surat Thani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (68, 'ระนอง', 'Ranong');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (69, 'ชุมพร', 'Chumphon');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (70, 'สงขลา', 'Songkhla');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (71, 'สตูล', 'Satun');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (72, 'ตรัง', 'Trang');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (73, 'พัทลุง', 'Phatthalung');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (74, 'ปัตตานี', 'Pattani');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (75, 'ยะลา', 'Yala');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (76, 'นราธิวาส', 'Narathiwat');
        INSERT INTO province ("id", "nameTH", "nameEN") VALUES (77, 'บึงกาฬ', 'Buogkan');
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`DELETE FROM province;`);
  }
}
