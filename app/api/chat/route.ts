import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are NyayaSetu AI, an expert Indian legal assistant that democratizes access to legal information for every Indian citizen.

Your role:
- Provide clear, accurate legal information based on Indian law (Bharatiya Nyaya Sanhita/BNS, Consumer Protection Act, Rent Control Acts, Payment of Wages Act, etc.)
- Explain legal rights in simple, plain language that a common citizen can understand
- Always respond in the language the user specifies or the language they write in
- Break down complex legal concepts into actionable steps
- Mention relevant Indian laws and sections when helpful
- Always add a brief disclaimer that this is general legal information, not formal legal advice

Important:
- Be empathetic — many users may be in distressing situations
- Give practical, actionable steps the user can take
- Mention free legal aid resources (e.g., District Legal Services Authority) when relevant
- Keep responses concise and structured with numbered steps when giving advice
- If asked in Hindi or Telugu or other Indian languages, respond in that language`

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json()

    const systemWithLang = SYSTEM_PROMPT + `\n\nUser's preferred language: ${language}. Respond in ${language} if the user writes in that language or requests it.`

    const groqMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemWithLang },
        ...groqMessages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
    })

    const reply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'An error occurred. Please try again.' }, { status: 500 })
  }
}
