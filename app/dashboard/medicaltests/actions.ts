// app/dashboard/medicaltests/actions.ts
'use server';

import { query } from '@/lib/db';

// Define the type for Medical Test with JOIN data
export interface MedicalTest {
  id: number;
  name: string;
  description: string | null;
  normalmin: number | null;
  normalmax: number | null;
  iduom: number | null;
  idcategory: number | null;
  uom_name: string | null;
  category_name: string | null;
}

export interface UomOption {
  id: number;
  name: string;
}

export interface CategoryOption {
  id: number;
  name: string;
}

// GET with JOIN to show names instead of IDs
export async function getMedicalTests(): Promise<MedicalTest[]> {
  try {
    const result = await query(`
      SELECT 
        mt.id,
        mt.name,
        mt.description,
        mt.normalmin,
        mt.normalmax,
        mt.iduom,
        mt.idcategory,
        u.name as uom_name,
        tc.name as category_name
      FROM medicaltests mt
      LEFT JOIN uom u ON mt.iduom = u.id
      LEFT JOIN testcategories tc ON mt.idcategory = tc.id
      ORDER BY mt.name
    `);
    
    return result.rows as MedicalTest[];
  } catch (error) {
    console.error('Error fetching medical tests:', error);
    throw new Error('Failed to fetch medical tests');
  }
}

export async function getUoms(): Promise<UomOption[]> {
  try {
    const result = await query(
      'SELECT id, name FROM uom ORDER BY name'
    );
    return result.rows as UomOption[];
  } catch (error) {
    console.error('Error fetching UOMs:', error);
    throw new Error('Failed to fetch UOMs');
  }
}

export async function getTestCategories(): Promise<CategoryOption[]> {
  try {
    const result = await query(
      'SELECT id, name FROM testcategories ORDER BY name'
    );
    return result.rows as CategoryOption[];
  } catch (error) {
    console.error('Error fetching test categories:', error);
    throw new Error('Failed to fetch test categories');
  }
}

export async function createMedicalTest(data: {
  name: string;
  description: string;
  iduom: number;
  idcategory: number;
  normalmin: number | null;
  normalmax: number | null;
}) {
  try {
    const result = await query(
      `INSERT INTO medicaltests (name, description, iduom, idcategory, normalmin, normalmax) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.name, data.description, data.iduom, data.idcategory, data.normalmin, data.normalmax]
    );
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A medical test with this name already exists' };
    }
    console.error('Error creating medical test:', error);
    return { error: 'Failed to create medical test' };
  }
}

export async function updateMedicalTest(id: number, data: {
  name: string;
  description: string;
  iduom: number;
  idcategory: number;
  normalmin: number | null;
  normalmax: number | null;
}) {
  try {
    const result = await query(
      `UPDATE medicaltests 
       SET name = $1, description = $2, iduom = $3, idcategory = $4, normalmin = $5, normalmax = $6 
       WHERE id = $7 RETURNING *`,
      [data.name, data.description, data.iduom, data.idcategory, data.normalmin, data.normalmax, id]
    );
    if (result.rows.length === 0) {
      return { error: 'Medical test not found' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A medical test with this name already exists' };
    }
    console.error('Error updating medical test:', error);
    return { error: 'Failed to update medical test' };
  }
}

export async function deleteMedicalTest(id: number) {
  try {
    const result = await query(
      'DELETE FROM medicaltests WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return { error: 'Medical test not found' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting medical test:', error);
    return { error: 'Failed to delete medical test' };
  }
}