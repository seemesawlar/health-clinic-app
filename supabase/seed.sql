-- Sample medication inventory for Cedarbrook Community Clinic.
-- Fictional clinic, fictional stock levels — but realistic drug names,
-- strengths, dosage forms, and wholesale distributor names, so the
-- dashboard, storage map, and reports demo the way they would on a
-- real clinic's dispensary. Safe to re-run on an empty schema; not
-- idempotent against a database that already has data in it.
--
-- Run schema.sql first, then this file.

-- ---------------------------------------------------------------------------
-- 1. Products (58 medications across the 12 pharmacy categories)
-- ---------------------------------------------------------------------------
insert into inventory_items
  (name, category, unit, reorder_point, location, supplier, item_code, unit_cost, needs_expiry_tracking, bin_details)
values
  -- Analgesics & Antipyretics
  ('Acetaminophen 500mg Tablet', 'Analgesics & Antipyretics', 'tablet', 200, 'NP – Storage (Zone A)', 'McKesson', 'MED-101', 0.04, true, null),
  ('Ibuprofen 200mg Tablet', 'Analgesics & Antipyretics', 'tablet', 200, 'NP – Storage (Zone A)', 'McKesson', 'MED-102', 0.05, true, null),
  ('Naproxen 500mg Tablet', 'Analgesics & Antipyretics', 'tablet', 100, 'NP – Storage (Zone A)', 'Cardinal Health', 'MED-103', 0.08, true, null),
  ('Acetaminophen Children''s Suspension 160mg/5mL', 'Analgesics & Antipyretics', 'bottle', 15, 'Walk-In – Clinic Room', 'McKesson', 'MED-104', 3.25, true, null),

  -- Antibiotics & Anti-Infectives
  ('Amoxicillin 500mg Capsule', 'Antibiotics & Anti-Infectives', 'capsule', 150, 'NP – Storage (Zone B)', 'Cardinal Health', 'MED-201', 0.12, true, null),
  ('Azithromycin 250mg Tablet', 'Antibiotics & Anti-Infectives', 'tablet', 60, 'NP – Storage (Zone B)', 'Cardinal Health', 'MED-202', 0.65, true, null),
  ('Ciprofloxacin 500mg Tablet', 'Antibiotics & Anti-Infectives', 'tablet', 60, 'NP – Storage (Zone B)', 'AmerisourceBergen', 'MED-203', 0.35, true, null),
  ('Doxycycline 100mg Capsule', 'Antibiotics & Anti-Infectives', 'capsule', 90, 'NP – Storage (Zone B)', 'AmerisourceBergen', 'MED-204', 0.22, true, null),
  ('Cephalexin 500mg Capsule', 'Antibiotics & Anti-Infectives', 'capsule', 90, 'NP – Storage (Zone B)', 'Cardinal Health', 'MED-205', 0.18, true, null),
  ('Metronidazole 500mg Tablet', 'Antibiotics & Anti-Infectives', 'tablet', 60, 'NP – Storage (Zone B)', 'McKesson', 'MED-206', 0.15, true, null),
  ('Nitrofurantoin 100mg Capsule', 'Antibiotics & Anti-Infectives', 'capsule', 60, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-207', 0.40, true, null),

  -- Cardiovascular & Antihypertensive
  ('Lisinopril 10mg Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 100, 'NP – Storage (Zone A)', 'McKesson', 'MED-301', 0.06, true, null),
  ('Amlodipine 5mg Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 100, 'NP – Storage (Zone A)', 'McKesson', 'MED-302', 0.05, true, null),
  ('Metoprolol Tartrate 50mg Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 100, 'NP – Storage (Zone A)', 'Cardinal Health', 'MED-303', 0.07, true, null),
  ('Atorvastatin 20mg Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 100, 'NP – Storage (Zone A)', 'AmerisourceBergen', 'MED-304', 0.09, true, null),
  ('Hydrochlorothiazide 25mg Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 60, 'NP – Storage (Zone A)', 'McKesson', 'MED-305', 0.04, true, null),
  ('Aspirin 81mg Low-Dose Tablet', 'Cardiovascular & Antihypertensive', 'tablet', 200, 'NP – Storage (Zone A)', 'Henry Schein Medical', 'MED-306', 0.02, true, null),

  -- Diabetes & Endocrine
  ('Metformin 500mg Tablet', 'Diabetes & Endocrine', 'tablet', 150, 'NP – Storage (Zone A)', 'McKesson', 'MED-401', 0.05, true, null),
  ('Glipizide 5mg Tablet', 'Diabetes & Endocrine', 'tablet', 60, 'NP – Storage (Zone A)', 'Cardinal Health', 'MED-402', 0.10, true, null),
  ('Insulin Glargine 100 units/mL Vial', 'Diabetes & Endocrine', 'vial', 10, 'Walk-In – Refrigerator', 'AmerisourceBergen', 'MED-403', 38.50, true, 'Vaccine Fridge — Door Shelf 3 • 36–46°F'),
  ('Levothyroxine 50mcg Tablet', 'Diabetes & Endocrine', 'tablet', 90, 'NP – Storage (Zone A)', 'McKesson', 'MED-404', 0.11, true, null),

  -- Respiratory & Allergy
  ('Albuterol Sulfate HFA Inhaler 90mcg', 'Respiratory & Allergy', 'inhaler', 15, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-501', 24.00, true, null),
  ('Fluticasone Propionate Nasal Spray 50mcg', 'Respiratory & Allergy', 'bottle', 10, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-502', 12.75, true, null),
  ('Cetirizine 10mg Tablet', 'Respiratory & Allergy', 'tablet', 100, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-503', 0.06, true, null),
  ('Loratadine 10mg Tablet', 'Respiratory & Allergy', 'tablet', 100, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-504', 0.05, true, null),
  ('Montelukast 10mg Tablet', 'Respiratory & Allergy', 'tablet', 60, 'Walk-In – Clinic Room', 'AmerisourceBergen', 'MED-505', 0.35, true, null),
  ('Guaifenesin 400mg Tablet', 'Respiratory & Allergy', 'tablet', 80, 'Health Shelter – Med Cart', 'McKesson', 'MED-506', 0.08, true, null),

  -- Gastrointestinal
  ('Omeprazole 20mg Capsule', 'Gastrointestinal', 'capsule', 100, 'NP – Storage (Zone A)', 'McKesson', 'MED-601', 0.07, true, null),
  ('Famotidine 20mg Tablet', 'Gastrointestinal', 'tablet', 80, 'NP – Storage (Zone A)', 'Cardinal Health', 'MED-602', 0.06, true, null),
  ('Loperamide 2mg Capsule', 'Gastrointestinal', 'capsule', 60, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-603', 0.10, true, null),
  ('Ondansetron 4mg Orally Disintegrating Tablet', 'Gastrointestinal', 'tablet', 40, 'Walk-In – Clinic Room', 'AmerisourceBergen', 'MED-604', 0.85, true, null),
  ('Docusate Sodium 100mg Capsule', 'Gastrointestinal', 'capsule', 60, 'Health Shelter – Med Cart', 'McKesson', 'MED-605', 0.05, true, null),

  -- Mental Health & Neurology
  ('Sertraline 50mg Tablet', 'Mental Health & Neurology', 'tablet', 60, 'NP – Storage (Zone B)', 'McKesson', 'MED-701', 0.12, true, null),
  ('Escitalopram 10mg Tablet', 'Mental Health & Neurology', 'tablet', 60, 'NP – Storage (Zone B)', 'Cardinal Health', 'MED-702', 0.20, true, null),
  ('Gabapentin 300mg Capsule', 'Mental Health & Neurology', 'capsule', 90, 'NP – Storage (Zone B)', 'AmerisourceBergen', 'MED-703', 0.09, true, null),
  ('Trazodone 50mg Tablet', 'Mental Health & Neurology', 'tablet', 60, 'NP – Storage (Zone B)', 'McKesson', 'MED-704', 0.08, true, null),

  -- Vaccines & Immunizations
  ('Influenza Vaccine (Quadrivalent) 0.5mL Prefilled Syringe', 'Vaccines & Immunizations', 'syringe', 20, 'Walk-In – Refrigerator', 'Henry Schein Medical', 'MED-801', 18.00, true, 'Vaccine Fridge — Door Shelf 1 • 36–46°F'),
  ('Tetanus-Diphtheria (Td) Vaccine 0.5mL Vial', 'Vaccines & Immunizations', 'vial', 10, 'Walk-In – Refrigerator', 'Henry Schein Medical', 'MED-802', 22.50, true, 'Vaccine Fridge — Door Shelf 1 • 36–46°F'),
  ('Hepatitis B Vaccine 1mL Vial', 'Vaccines & Immunizations', 'vial', 10, 'Walk-In – Refrigerator', 'Henry Schein Medical', 'MED-803', 45.00, true, 'Vaccine Fridge — Door Shelf 2 • 36–46°F'),
  ('Pneumococcal Vaccine (PPSV23) 0.5mL Vial', 'Vaccines & Immunizations', 'vial', 8, 'Walk-In – Refrigerator', 'Henry Schein Medical', 'MED-804', 55.00, true, 'Vaccine Fridge — Door Shelf 2 • 36–46°F'),

  -- Topical & Dermatologic
  ('Hydrocortisone Cream 1%', 'Topical & Dermatologic', 'tube', 15, 'Health Shelter – Med Cart', 'Cardinal Health', 'MED-901', 2.10, true, null),
  ('Mupirocin Ointment 2%', 'Topical & Dermatologic', 'tube', 10, 'NP – Storage (Zone B)', 'McKesson', 'MED-902', 6.40, true, null),
  ('Clotrimazole Antifungal Cream 1%', 'Topical & Dermatologic', 'tube', 15, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-903', 3.00, true, null),
  ('Bacitracin Zinc Ointment', 'Topical & Dermatologic', 'tube', 20, 'Health Shelter – Med Cart', 'McKesson', 'MED-904', 1.75, true, null),

  -- Emergency & Anaphylaxis
  ('Epinephrine Auto-Injector 0.3mg', 'Emergency & Anaphylaxis', 'each', 6, 'Walk-In – Clinic Room', 'AmerisourceBergen', 'MED-1001', 110.00, true, 'Emergency Kit — Red Bin'),
  ('Diphenhydramine Injection 50mg/mL', 'Emergency & Anaphylaxis', 'vial', 10, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-1002', 4.20, true, null),
  ('Naloxone Nasal Spray 4mg', 'Emergency & Anaphylaxis', 'box', 10, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-1003', 45.00, true, null),
  ('Albuterol Sulfate Nebulizer Solution 2.5mg/3mL', 'Emergency & Anaphylaxis', 'box', 8, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-1004', 16.00, true, null),

  -- Controlled Substances
  ('Lorazepam 1mg Tablet', 'Controlled Substances', 'tablet', 30, 'NP – Controlled Cabinet', 'McKesson', 'MED-1101', 0.30, true, 'Locked Cabinet — Shelf 1 • CII–CV Log Required'),
  ('Alprazolam 0.5mg Tablet', 'Controlled Substances', 'tablet', 30, 'NP – Controlled Cabinet', 'McKesson', 'MED-1102', 0.28, true, 'Locked Cabinet — Shelf 1 • CII–CV Log Required'),
  ('Hydrocodone/Acetaminophen 5/325mg Tablet', 'Controlled Substances', 'tablet', 30, 'NP – Controlled Cabinet', 'Cardinal Health', 'MED-1103', 0.45, true, 'Locked Cabinet — Shelf 2 • CII–CV Log Required'),
  ('Tramadol 50mg Tablet', 'Controlled Substances', 'tablet', 40, 'NP – Controlled Cabinet', 'AmerisourceBergen', 'MED-1104', 0.22, true, 'Locked Cabinet — Shelf 2 • CII–CV Log Required'),
  ('Zolpidem 10mg Tablet', 'Controlled Substances', 'tablet', 30, 'NP – Controlled Cabinet', 'McKesson', 'MED-1105', 0.32, true, 'Locked Cabinet — Shelf 2 • CII–CV Log Required'),

  -- Over-the-Counter & First Aid
  ('Antiseptic Wipes (Benzalkonium Chloride)', 'Over-the-Counter & First Aid', 'box', 20, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-1201', 4.50, true, null),
  ('Saline Nasal Spray', 'Over-the-Counter & First Aid', 'bottle', 15, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-1202', 2.75, true, null),
  ('Electrolyte Oral Rehydration Solution Packets', 'Over-the-Counter & First Aid', 'box', 20, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-1203', 6.00, true, null),
  ('Antacid Chewable Tablets (Calcium Carbonate 500mg)', 'Over-the-Counter & First Aid', 'bottle', 20, 'Health Shelter – Med Cart', 'Henry Schein Medical', 'MED-1204', 3.10, true, null),
  ('Hand Sanitizer 70% Alcohol Gel 8oz', 'Over-the-Counter & First Aid', 'bottle', 30, 'Walk-In – Clinic Room', 'Cardinal Health', 'MED-1205', 2.40, true, null);

-- ---------------------------------------------------------------------------
-- 2. Batches — a deliberate mix of expired, near-expiry, and healthy stock
--    (and a couple of items split across two locations) so the dashboard,
--    storage map, and expired-batch report all have something to show.
-- ---------------------------------------------------------------------------
insert into inventory_batches (item_id, quantity, expiry_date, location)
select i.id, v.quantity, v.expiry_date, v.location
from (values
  -- Analgesics & Antipyretics
  ('Acetaminophen 500mg Tablet', 320, (current_date + interval '20 months')::date, 'NP – Storage (Zone A)'),
  ('Acetaminophen 500mg Tablet', 80,  (current_date + interval '3 months')::date,  'Walk-In – Clinic Room'),
  ('Ibuprofen 200mg Tablet', 260, (current_date + interval '16 months')::date, 'NP – Storage (Zone A)'),
  ('Naproxen 500mg Tablet', 40,  (current_date - interval '9 days')::date,   'NP – Storage (Zone A)'),  -- expired
  ('Acetaminophen Children''s Suspension 160mg/5mL', 8, (current_date + interval '11 months')::date, 'Walk-In – Clinic Room'),

  -- Antibiotics & Anti-Infectives
  ('Amoxicillin 500mg Capsule', 210, (current_date + interval '14 months')::date, 'NP – Storage (Zone B)'),
  ('Azithromycin 250mg Tablet', 45,  (current_date + interval '9 months')::date,  'NP – Storage (Zone B)'),
  ('Ciprofloxacin 500mg Tablet', 20, (current_date + interval '18 days')::date,  'NP – Storage (Zone B)'), -- near-expiry
  ('Doxycycline 100mg Capsule', 70,  (current_date + interval '10 months')::date, 'NP – Storage (Zone B)'),
  ('Cephalexin 500mg Capsule', 55,   (current_date + interval '13 months')::date, 'NP – Storage (Zone B)'),
  ('Metronidazole 500mg Tablet', 30, (current_date - interval '4 days')::date,   'NP – Storage (Zone B)'),  -- expired
  ('Nitrofurantoin 100mg Capsule', 40, (current_date + interval '12 months')::date, 'Walk-In – Clinic Room'),

  -- Cardiovascular & Antihypertensive
  ('Lisinopril 10mg Tablet', 180, (current_date + interval '17 months')::date, 'NP – Storage (Zone A)'),
  ('Amlodipine 5mg Tablet', 150,  (current_date + interval '15 months')::date, 'NP – Storage (Zone A)'),
  ('Metoprolol Tartrate 50mg Tablet', 90, (current_date + interval '11 months')::date, 'NP – Storage (Zone A)'),
  ('Atorvastatin 20mg Tablet', 40, (current_date + interval '22 days')::date, 'NP – Storage (Zone A)'),  -- near-expiry
  ('Hydrochlorothiazide 25mg Tablet', 50, (current_date + interval '8 months')::date, 'NP – Storage (Zone A)'),
  ('Aspirin 81mg Low-Dose Tablet', 400,  (current_date + interval '24 months')::date, 'NP – Storage (Zone A)'),

  -- Diabetes & Endocrine
  ('Metformin 500mg Tablet', 260, (current_date + interval '16 months')::date, 'NP – Storage (Zone A)'),
  ('Glipizide 5mg Tablet', 25,    (current_date - interval '15 days')::date,   'NP – Storage (Zone A)'),  -- expired
  ('Insulin Glargine 100 units/mL Vial', 6, (current_date + interval '5 months')::date, 'Walk-In – Refrigerator'),
  ('Levothyroxine 50mcg Tablet', 100, (current_date + interval '13 months')::date, 'NP – Storage (Zone A)'),

  -- Respiratory & Allergy
  ('Albuterol Sulfate HFA Inhaler 90mcg', 9,  (current_date + interval '10 months')::date, 'Walk-In – Clinic Room'),
  ('Fluticasone Propionate Nasal Spray 50mcg', 12, (current_date + interval '9 months')::date, 'Walk-In – Clinic Room'),
  ('Cetirizine 10mg Tablet', 140, (current_date + interval '18 months')::date, 'Health Shelter – Med Cart'),
  ('Loratadine 10mg Tablet', 60,  (current_date + interval '25 days')::date,  'Health Shelter – Med Cart'),  -- near-expiry
  ('Montelukast 10mg Tablet', 35, (current_date + interval '7 months')::date, 'Walk-In – Clinic Room'),
  ('Guaifenesin 400mg Tablet', 90, (current_date + interval '14 months')::date, 'Health Shelter – Med Cart'),

  -- Gastrointestinal
  ('Omeprazole 20mg Capsule', 130, (current_date + interval '15 months')::date, 'NP – Storage (Zone A)'),
  ('Famotidine 20mg Tablet', 70,   (current_date + interval '11 months')::date, 'NP – Storage (Zone A)'),
  ('Loperamide 2mg Capsule', 45,   (current_date + interval '20 months')::date, 'Health Shelter – Med Cart'),
  ('Ondansetron 4mg Orally Disintegrating Tablet', 15, (current_date - interval '2 days')::date, 'Walk-In – Clinic Room'), -- expired
  ('Docusate Sodium 100mg Capsule', 50, (current_date + interval '19 months')::date, 'Health Shelter – Med Cart'),

  -- Mental Health & Neurology
  ('Sertraline 50mg Tablet', 70,   (current_date + interval '12 months')::date, 'NP – Storage (Zone B)'),
  ('Escitalopram 10mg Tablet', 55, (current_date + interval '10 months')::date, 'NP – Storage (Zone B)'),
  ('Gabapentin 300mg Capsule', 110, (current_date + interval '14 months')::date, 'NP – Storage (Zone B)'),
  ('Trazodone 50mg Tablet', 40,    (current_date + interval '9 months')::date, 'NP – Storage (Zone B)'),

  -- Vaccines & Immunizations
  ('Influenza Vaccine (Quadrivalent) 0.5mL Prefilled Syringe', 24, (current_date + interval '6 months')::date, 'Walk-In – Refrigerator'),
  ('Tetanus-Diphtheria (Td) Vaccine 0.5mL Vial', 8,  (current_date + interval '10 days')::date, 'Walk-In – Refrigerator'),  -- near-expiry
  ('Hepatitis B Vaccine 1mL Vial', 14, (current_date + interval '11 months')::date, 'Walk-In – Refrigerator'),
  ('Pneumococcal Vaccine (PPSV23) 0.5mL Vial', 5, (current_date - interval '6 days')::date, 'Walk-In – Refrigerator'),  -- expired

  -- Topical & Dermatologic
  ('Hydrocortisone Cream 1%', 22,  (current_date + interval '16 months')::date, 'Health Shelter – Med Cart'),
  ('Mupirocin Ointment 2%', 6,     (current_date + interval '13 months')::date, 'NP – Storage (Zone B)'),
  ('Clotrimazole Antifungal Cream 1%', 18, (current_date + interval '17 months')::date, 'Health Shelter – Med Cart'),
  ('Bacitracin Zinc Ointment', 28, (current_date + interval '19 months')::date, 'Health Shelter – Med Cart'),

  -- Emergency & Anaphylaxis
  ('Epinephrine Auto-Injector 0.3mg', 4, (current_date + interval '28 days')::date, 'Walk-In – Clinic Room'),  -- near-expiry, and below reorder point
  ('Diphenhydramine Injection 50mg/mL', 14, (current_date + interval '14 months')::date, 'Walk-In – Clinic Room'),
  ('Naloxone Nasal Spray 4mg', 16, (current_date + interval '15 months')::date, 'Health Shelter – Med Cart'),
  ('Albuterol Sulfate Nebulizer Solution 2.5mg/3mL', 10, (current_date + interval '12 months')::date, 'Walk-In – Clinic Room'),

  -- Controlled Substances
  ('Lorazepam 1mg Tablet', 40, (current_date + interval '11 months')::date, 'NP – Controlled Cabinet'),
  ('Alprazolam 0.5mg Tablet', 35, (current_date + interval '9 months')::date, 'NP – Controlled Cabinet'),
  ('Hydrocodone/Acetaminophen 5/325mg Tablet', 22, (current_date + interval '10 months')::date, 'NP – Controlled Cabinet'),  -- below reorder point
  ('Tramadol 50mg Tablet', 60, (current_date + interval '13 months')::date, 'NP – Controlled Cabinet'),
  ('Zolpidem 10mg Tablet', 28, (current_date + interval '8 months')::date, 'NP – Controlled Cabinet'),  -- below reorder point

  -- Over-the-Counter & First Aid
  ('Antiseptic Wipes (Benzalkonium Chloride)', 34, (current_date + interval '22 months')::date, 'Health Shelter – Med Cart'),
  ('Saline Nasal Spray', 26, (current_date + interval '18 months')::date, 'Health Shelter – Med Cart'),
  ('Electrolyte Oral Rehydration Solution Packets', 45, (current_date + interval '20 months')::date, 'Health Shelter – Med Cart'),
  ('Antacid Chewable Tablets (Calcium Carbonate 500mg)', 30, (current_date + interval '16 months')::date, 'Health Shelter – Med Cart'),
  ('Hand Sanitizer 70% Alcohol Gel 8oz', 40, (current_date + interval '24 months')::date, 'Walk-In – Clinic Room')
) as v(item_name, quantity, expiry_date, location)
join inventory_items i on i.name = v.item_name;

-- ---------------------------------------------------------------------------
-- 3. Usage history — spread across the last 3 months and all three teams,
--    so Reports has more than one month to pick from and a meaningful
--    "most consumed" ranking. Recorded directly (not via record_usage())
--    since these are backdated and shouldn't touch current batch stock.
-- ---------------------------------------------------------------------------
insert into usage_log (item_id, item_name, team, quantity, note, used_at)
select i.id, v.item_name, v.team, v.quantity, v.note, v.used_at
from (values
  ('Acetaminophen 500mg Tablet', 'Walk-In Clinic', 20, null, now() - interval '2 days'),
  ('Ibuprofen 200mg Tablet', 'Health Shelter', 15, null, now() - interval '3 days'),
  ('Amoxicillin 500mg Capsule', 'Nurse Practitioners', 30, 'Pediatric ear infection course', now() - interval '4 days'),
  ('Albuterol Sulfate HFA Inhaler 90mcg', 'Walk-In Clinic', 1, null, now() - interval '5 days'),
  ('Cetirizine 10mg Tablet', 'Health Shelter', 10, null, now() - interval '6 days'),
  ('Lisinopril 10mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '7 days'),
  ('Metformin 500mg Tablet', 'Nurse Practitioners', 60, 'Monthly refill', now() - interval '8 days'),
  ('Omeprazole 20mg Capsule', 'Walk-In Clinic', 14, null, now() - interval '9 days'),
  ('Hydrocortisone Cream 1%', 'Health Shelter', 2, null, now() - interval '10 days'),
  ('Sertraline 50mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '11 days'),
  ('Epinephrine Auto-Injector 0.3mg', 'Walk-In Clinic', 1, 'Anaphylaxis, EMS called', now() - interval '12 days'),
  ('Naloxone Nasal Spray 4mg', 'Health Shelter', 1, null, now() - interval '13 days'),
  ('Acetaminophen 500mg Tablet', 'Health Shelter', 30, null, now() - interval '14 days'),
  ('Doxycycline 100mg Capsule', 'Nurse Practitioners', 14, null, now() - interval '15 days'),
  ('Loratadine 10mg Tablet', 'Health Shelter', 10, null, now() - interval '16 days'),
  ('Naproxen 500mg Tablet', 'Walk-In Clinic', 12, null, now() - interval '18 days'),
  ('Influenza Vaccine (Quadrivalent) 0.5mL Prefilled Syringe', 'Walk-In Clinic', 4, 'Walk-in flu clinic', now() - interval '19 days'),
  ('Gabapentin 300mg Capsule', 'Nurse Practitioners', 60, 'Monthly refill', now() - interval '20 days'),
  ('Antiseptic Wipes (Benzalkonium Chloride)', 'Health Shelter', 3, null, now() - interval '21 days'),
  ('Amlodipine 5mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '22 days'),
  ('Ibuprofen 200mg Tablet', 'Walk-In Clinic', 18, null, now() - interval '24 days'),
  ('Famotidine 20mg Tablet', 'Health Shelter', 14, null, now() - interval '25 days'),
  ('Diphenhydramine Injection 50mg/mL', 'Walk-In Clinic', 1, 'Allergic reaction', now() - interval '27 days'),
  ('Mupirocin Ointment 2%', 'Nurse Practitioners', 1, null, now() - interval '29 days'),
  ('Acetaminophen 500mg Tablet', 'Walk-In Clinic', 24, null, now() - interval '32 days'),
  ('Amoxicillin 500mg Capsule', 'Walk-In Clinic', 21, null, now() - interval '34 days'),
  ('Metformin 500mg Tablet', 'Nurse Practitioners', 60, 'Monthly refill', now() - interval '38 days'),
  ('Lisinopril 10mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '40 days'),
  ('Cetirizine 10mg Tablet', 'Health Shelter', 15, null, now() - interval '42 days'),
  ('Ondansetron 4mg Orally Disintegrating Tablet', 'Walk-In Clinic', 4, null, now() - interval '45 days'),
  ('Loperamide 2mg Capsule', 'Health Shelter', 8, null, now() - interval '47 days'),
  ('Sertraline 50mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '48 days'),
  ('Ibuprofen 200mg Tablet', 'Health Shelter', 20, null, now() - interval '50 days'),
  ('Hydrocodone/Acetaminophen 5/325mg Tablet', 'Nurse Practitioners', 8, 'Post-procedure, short course', now() - interval '52 days'),
  ('Guaifenesin 400mg Tablet', 'Health Shelter', 16, null, now() - interval '55 days'),
  ('Acetaminophen 500mg Tablet', 'Health Shelter', 28, null, now() - interval '58 days'),
  ('Azithromycin 250mg Tablet', 'Nurse Practitioners', 6, null, now() - interval '60 days'),
  ('Fluticasone Propionate Nasal Spray 50mcg', 'Walk-In Clinic', 1, null, now() - interval '63 days'),
  ('Albuterol Sulfate HFA Inhaler 90mcg', 'Health Shelter', 1, null, now() - interval '65 days'),
  ('Lorazepam 1mg Tablet', 'Nurse Practitioners', 10, 'Short-term anxiety course', now() - interval '68 days'),
  ('Amoxicillin 500mg Capsule', 'Nurse Practitioners', 30, null, now() - interval '70 days'),
  ('Bacitracin Zinc Ointment', 'Health Shelter', 2, null, now() - interval '72 days'),
  ('Metformin 500mg Tablet', 'Nurse Practitioners', 60, 'Monthly refill', now() - interval '75 days'),
  ('Ibuprofen 200mg Tablet', 'Walk-In Clinic', 22, null, now() - interval '78 days'),
  ('Escitalopram 10mg Tablet', 'Nurse Practitioners', 30, 'Monthly refill', now() - interval '80 days'),
  ('Cetirizine 10mg Tablet', 'Health Shelter', 12, null, now() - interval '83 days'),
  ('Hand Sanitizer 70% Alcohol Gel 8oz', 'Health Shelter', 4, null, now() - interval '85 days'),
  ('Acetaminophen 500mg Tablet', 'Walk-In Clinic', 26, null, now() - interval '88 days')
) as v(item_name, team, quantity, note, used_at)
join inventory_items i on i.name = v.item_name;
