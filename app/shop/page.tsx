import { Suspense } from "react";
import ShopClient from "./ShopClient";

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-primary font-serif text-xl">Loading Collection...</div>}>
            <ShopClient />
        </Suspense>
    );
}
