"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

interface Account {
    id: string;
    institution_name: string;
    account_name: string;
}

const AccountFilter: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentAccount = searchParams.get('accountId') || '';

    useEffect(() => {
        const fetchAccounts = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('bank_accounts').select('id, institution_name, account_name');
            if (data) setAccounts(data);
        };
        fetchAccounts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.set('accountId', val);
        } else {
            params.delete('accountId');
        }
        router.push(`?${params.toString()}`);
    };

    if (accounts.length === 0) return null;

    return (
        <select 
            className="bg-white dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-primary-500"
            value={currentAccount}
            onChange={handleChange}
        >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {acc.institution_name} - {acc.account_name}
                </option>
            ))}
        </select>
    );
};

export default AccountFilter;
