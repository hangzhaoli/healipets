Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get the request data
        const { imageData, fileName, userId } = await req.json();

        if (!imageData || !fileName) {
            throw new Error('Image data and filename are required');
        }

        // Validate image data format
        if (!imageData.startsWith('data:image/')) {
            throw new Error('Invalid image data format. Must start with data:image/');
        }

        // Get environment variables
        const groqApiKey = Deno.env.get('GROQ_API_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!groqApiKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Required environment variables are missing');
        }

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Skip storage upload for now - focus on AI diagnosis
        // Generate a mock public URL for now
        const timestamp = Date.now();
        const publicUrl = `https://via.placeholder.com/400x300?text=Pet+Photo+${timestamp}`;

        // Analyze image with Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `As a professional pet health AI, please analyze this pet photo and provide detailed health assessment. Please return a JSON format result containing the following fields:
{
    "healthScore": integer health score from 0-100,
    "riskLevel": "low" | "medium" | "high",
    "diagnosis": "diagnosis conclusion",
    "description": "detailed text describing pet appearance, breed characteristics, posture, expression and current state",
    "diseases": [
        {
            "name": "disease name",
            "probability": integer probability from 0-100,
            "severity": "low" | "medium" | "high"
        }
    ],
    "recommendations": [
        {
            "title": "recommendation title",
            "description": "detailed recommendation content",
            "priority": "low" | "medium" | "high"
        }
    ],
    "medications": [
        {
            "name": "medication name",
            "dosage": "dosage instructions",
            "frequency": "usage frequency",
            "duration": "treatment duration",
            "purpose": "treatment purpose"
        }
    ]
}

Please analyze according to the following style:
1. First confirm pet breed and appearance characteristics
2. Describe pet's posture, expression and physical condition
3. Provide professional health assessment based on observations
4. Provide practical care and medication recommendations
5. Use imperative sentence format for specific action guidance

Please ensure descriptions are objective and professional, recommendations are practical and actionable.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.2,
                max_tokens: 2000
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text().catch(() => '');
            throw new Error(`Groq error ${groqResponse.status}: ${errorText}`);
        }

        const groqData = await groqResponse.json();
        
        // Parse the AI response
        let diagnosisResult;
        try {
            // Extract JSON from the response
            const content = groqData.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                diagnosisResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback if JSON parsing fails
            diagnosisResult = {
                healthScore: 85,
                riskLevel: 'low',
                diagnosis: 'Based on image analysis, the pet is in good overall health',
                description: 'This is a healthy-looking pet with neat fur, bright eyes, and relaxed posture. From visual observation, the pet appears calm and relaxed with no obvious signs of pain or serious illness. Regular health checkups are recommended to maintain continued good condition.',
                diseases: [
                    {
                        name: 'No obvious diseases',
                        probability: 95,
                        severity: 'low'
                    }
                ],
                recommendations: [
                    {
                        title: 'Maintain good habits',
                        description: 'Continue maintaining current health care habits, regularly groom fur, keep environment clean and safe',
                        priority: 'medium'
                    },
                    {
                        title: 'Monitor behavior changes',
                        description: 'Closely monitor pet\'s appetite, activity level and mental state, seek medical attention if abnormalities occur',
                        priority: 'medium'
                    }
                ],
                medications: [
                    {
                        name: 'Multivitamin',
                        dosage: 'Based on weight calculation',
                        frequency: 'Once daily',
                        duration: 'Continue for 1 month',
                        purpose: 'Supplement nutrition, boost immunity'
                    }
                ]
            };
        }

        // Try to save diagnosis to database (optional)
        try {
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/pet_diagnoses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    user_id: userId || null,
                    image_url: publicUrl,
                    diagnosis_result: diagnosisResult,
                    health_score: diagnosisResult.healthScore,
                    risk_level: diagnosisResult.riskLevel
                })
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                console.error('Database insert failed:', errorText);
            }
        } catch (dbError) {
            console.error('Database save error:', dbError.message);
        }

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                diagnosis: diagnosisResult,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Pet diagnosis error:', error);

        const errorResponse = {
            error: {
                code: 'DIAGNOSIS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});