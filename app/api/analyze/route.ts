import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Extract readable text directly from PDF buffer
  const raw = buffer.toString('latin1')
  
  // Pull text between BT (begin text) and ET (end text) PDF markers
  const textChunks: string[] = []
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1]
    // Extract strings inside parentheses
    const strRegex = /\(([^)]+)\)/g
    let strMatch
    while ((strMatch = strRegex.exec(block)) !== null) {
      const text = strMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim()
      if (text.length > 1) textChunks.push(text)
    }
  }

  return textChunks.join(' ').replace(/\s+/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string || 'English'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    let contractText = ''

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      contractText = await extractTextFromPDF(buffer)
    } else {
      contractText = await file.text()
    }

    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from the document. Please try uploading a .txt file instead.' },
        { status: 400 }
      )
    }

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
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse analysis response')

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