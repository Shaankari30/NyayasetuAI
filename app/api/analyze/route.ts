import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string || 'English'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Extract text from file
    let contractText = ''

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF: read as buffer and parse
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      try {
        // Dynamic import to avoid SSR issues
        const pdfParse = (await import('pdf-parse')).default
        const data = await pdfParse(buffer)
        contractText = data.text
      } catch {
        // Fallback: try reading as text
        contractText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ')
      }
    } else {
      // Plain text file
      contractText = await file.text()
    }

    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from the document. Please try a text file.' }, { status: 400 })
    }

    // Truncate to avoid token limits
    const truncated = contractText.slice(0, 6000)

    const prompt = `You are NyayaSetu AI, an expert Indian legal assistant. Analyze the following contract/document under Indian law.

CONTRACT TEXT:
"""
${truncated}
"""

Analyze this document and respond ONLY with a valid JSON object in this exact structure (no markdown, no extra text):
{
  "summary": "2-3 sentence plain language summary of what this document is about",
  "risks": [
    {
      "level": "high|medium|low",
      "clause": "The specific clause or section that is risky",
      "explanation": "Why this is risky under Indian law and what the citizen should know"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}

Rules:
- Identify 3-6 risks (mix of high, medium, low)
- Focus on clauses that affect tenant/employee/consumer rights under Indian law
- Give 3-4 practical recommendations
- Keep language simple and in ${language}
- Return ONLY the JSON, no other text`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.2,
    })

    const raw = completion.choices[0]?.message?.content || ''

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse analysis response')
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please ensure the document contains readable text.' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
