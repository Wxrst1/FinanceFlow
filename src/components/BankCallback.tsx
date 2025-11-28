
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const BankCallback = () => {
    useEffect(() => {
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center flex-col gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <h2 className="text-white font-bold text-xl">A conectar ao banco...</h2>
        </div>
    );
};
export default BankCallback;
