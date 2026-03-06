'use server';

import { createClient } from "@/lib/supabase/server";

export async function getDeductibleTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('id, date, description, amount, categories (name)')
        .eq('user_id', user.id)
        .eq('is_deductible', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching deductible transactions:', error);
        return [];
    }

    return data.map(tx => ({ ...tx, category: tx.categories[0]?.name || 'Uncategorized' }));
}