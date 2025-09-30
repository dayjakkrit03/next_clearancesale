export default function AdminCategoriesPage() {
    return (
        <div className="space-y-4">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
            หน้านี้เป็น mock ยังไม่เชื่อม API — ขั้นต่อไปเราจะผูกกับ <code className="font-mono">/api/admin/clearance/categories</code>
        </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                "LAN (UTP) System",
                "FIBER OPTIC System",
                "Telephone CABLE",
                ].map((name) => (
                <div
                    key={name}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                >
                    <div className="text-sm text-muted-foreground mb-1">ตัวอย่างรายการ</div>
                    <div className="font-semibold">{name}</div>
                </div>
                ))}
            </div>
        </div>
    );
}
