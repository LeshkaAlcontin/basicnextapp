// app/dashboard/uom/actions.ts
'use server';

import { query } from '@/lib/db';

export interface Uom {
  id: number;
  name: string;
  description: string | null;
}

export async function getUoms(): Promise<Uom[]> {
  try {
    const result = await query(
      'SELECT id, name, description FROM uom ORDER BY name'
    );
    return result.rows as Uom[];
  } catch (error) {
    console.error('Error fetching UOMs:', error);
    throw new Error('Failed to fetch UOMs');
  }
}

export async function createUom(formData: { name: string; description: string }) {
  try {
    const result = await query(
      'INSERT INTO uom (name, description) VALUES ($1, $2) RETURNING *',
      [formData.name, formData.description]
    );
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A UOM with this name already exists' };
    }
    console.error('Error creating UOM:', error);
    return { error: 'Failed to create UOM' };
  }
}

export async function updateUom(id: number, formData: { name: string; description: string }) {
  try {
    const result = await query(
      'UPDATE uom SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [formData.name, formData.description, id]
    );
    if (result.rows.length === 0) {
      return { error: 'UOM not found' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A UOM with this name already exists' };
    }
    console.error('Error updating UOM:', error);
    return { error: 'Failed to update UOM' };
  }
}

export async function deleteUom(id: number) {
  try {
    const result = await query(
      'DELETE FROM uom WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return { error: 'UOM not found' };
    }
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { error: 'Cannot delete UOM because it is used in medical tests' };
    }
    console.error('Error deleting UOM:', error);
    return { error: 'Failed to delete UOM' };
  }
}