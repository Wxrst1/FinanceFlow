
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, StandardFonts, rgb } from 'https://cdn.skypack.dev/pdf-lib';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { reportData, userName } = await req.json();

    // 1. Create PDF in Memory (Fast, C++ bindings via WASM)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // 2. Draw Content
    page.drawText(`Relatório Financeiro: ${userName}`, {
        x: 50,
        y: height - 50,
        size: 20,
        font: font,
        color: rgb(0, 0.53, 0.71),
    });

    page.drawText(`Resumo: ${reportData.narrative.summary}`, {
        x: 50,
        y: height - 100,
        size: 12,
        font: font,
        maxWidth: width - 100,
    });

    // 3. Serialize to Bytes
    const pdfBytes = await pdfDoc.save()

    // 4. Return Binary Stream
    return new Response(pdfBytes, {
      headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="report.pdf"'
      },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
