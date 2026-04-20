import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import os from 'os';
import { SentenceItem } from '@/types';

function getOpenAIClient(): OpenAI {
  const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
  let apiKey = process.env.OPENAI_API_KEY || '';
  let baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (fs.existsSync(configPath)) {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as { openai?: { api_key?: string; base_url?: string } };
    if (config?.openai?.api_key && config.openai.api_key !== '${GENSPARK_TOKEN}') {
      apiKey = config.openai.api_key;
    }
    if (config?.openai?.base_url) {
      baseURL = config.openai.base_url;
    }
  }

  return new OpenAI({ apiKey, baseURL });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '画像が提供されていません' }, { status: 400 });
    }

    const client = getOpenAIClient();
    const allSentences: SentenceItem[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';

      const response = await client.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: `この画像には英文と日本語訳が含まれています。英文の中で赤色で表示されている単語やフレーズを特定してください。

以下のJSON形式で全ての例文を返してください。赤文字がない場合や不明な場合は空配列にしてください：

{
  "sentences": [
    {
      "englishFull": "完全な英文",
      "redWords": ["赤文字の単語1", "赤文字のフレーズ2"],
      "japaneseTranslation": "日本語訳"
    }
  ]
}

注意事項：
- 赤色/赤文字で書かれた単語・フレーズのみをredWordsに含めてください
- 英文は元の形を保持してください（大文字小文字含む）
- 画像に複数の例文がある場合は全て含めてください
- JSONのみを返してください（説明文は不要）`,
              },
            ],
          },
        ],
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // JSONを抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('JSONが見つかりません:', content);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]) as { sentences: Array<{ englishFull: string; redWords: string[]; japaneseTranslation: string }> };
      
      if (parsed.sentences && Array.isArray(parsed.sentences)) {
        parsed.sentences.forEach((s, index) => {
          allSentences.push({
            id: `${Date.now()}-${index}`,
            englishFull: s.englishFull || '',
            redWords: s.redWords || [],
            japaneseTranslation: s.japaneseTranslation || '',
          });
        });
      }
    }

    return NextResponse.json({ sentences: allSentences });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: `画像の解析中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}
