// app/dashboard/testcategories/actions.ts
'use server';

import { query } from '@/lib/db';

export interface TestCategory {
  id: number;
  name: string;
  description: string | null;
}

export async function getTestCategories(): Promise<TestCategory[]> {
  try {
    const result = await query(
      'SELECT id, name, description FROM testcategories ORDER BY name'
    );
    return result.rows as TestCategory[];
  } catch (error) {
    console.error('Error fetching test categories:', error);
    throw new Error('Failed to fetch test categories');
  }
}

export async function createTestCategory(formData: { name: string; description: string }) {
  try {
    const result = await query(
      'INSERT INTO testcategories (name, description) VALUES ($1, $2) RETURNING *',
      [formData.name, formData.description]
    );
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' };
    }
    console.error('Error creating test category:', error);
    return { error: 'Failed to create test category' };
  }
}

export async function updateTestCategory(id: number, formData: { name: string; description: string }) {
  try {
    const result = await query(
      'UPDATE testcategories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [formData.name, formData.description, id]
    );
    if (result.rows.length === 0) {
      return { error: 'Category not found' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' };
    }
    console.error('Error updating test category:', error);
    return { error: 'Failed to update test category' };
  }
}

export async function deleteTestCategory(id: number) {
  try {
    const result = await query(
      'DELETE FROM testcategories WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return { error: 'Category not found' };
    }
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { error: 'Cannot delete category because it is used in medical tests' };
    }
    console.error('Error deleting test category:', error);
    return { error: 'Failed to delete test category' };
  }
}