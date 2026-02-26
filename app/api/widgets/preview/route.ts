import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();

        // We forward the payload to the backend's render endpoint. 
        // Wait, the backend doesn't have a POST /render to just return HTML from config,
        // it only has GET /render/:id. 
        // Let me just recreate the simple "renderWidgetHTML" here since it's just a pure function!
        // Or better, just add a POST /render/preview in the backend. Let's redirect to the backend.

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

        // Call our backend API that returns raw HTML based on config JSON
        const res = await fetch(`${backendUrl}/api/widgets/preview-html`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (!res.ok) {
            throw new Error(`Backend returned ${res.status}`);
        }

        const html = await res.text();
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (error) {
        console.error("Preview render error:", error);
        return new NextResponse("Error generating preview", { status: 500 });
    }
}
