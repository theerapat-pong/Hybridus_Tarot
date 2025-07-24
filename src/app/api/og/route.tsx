import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardNames = JSON.parse(searchParams.get('cardNames') || '[]')
    const summary = searchParams.get('summary') || ''
    const question = searchParams.get('question') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0b',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #451a03 0%, transparent 50%)',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <h1
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                color: '#a855f7',
                margin: '0',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Hybridus Tarot
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                margin: '0',
                textAlign: 'center',
              }}
            >
              Your Tarot Reading
            </p>
          </div>

          {/* Cards Section */}
          {cardNames && cardNames.length === 3 && (
            <div
              style={{
                display: 'flex',
                gap: '30px',
                marginBottom: '40px',
                alignItems: 'center',
              }}
            >
              {['Past', 'Present', 'Future'].map((position, index) => (
                <div
                  key={position}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#a855f7',
                      fontWeight: '500',
                    }}
                  >
                    {position}
                  </div>
                  <div
                    style={{
                      width: '120px',
                      height: '180px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '2px solid rgba(168, 85, 247, 0.5)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#e2e8f0',
                        textAlign: 'center',
                        padding: '8px',
                        fontWeight: '500',
                        lineHeight: '1.3',
                      }}
                    >
                      {cardNames[index] || ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Section */}
          {summary && (
            <div
              style={{
                maxWidth: '800px',
                padding: '24px',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '16px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '16px',
                  color: '#f8fafc',
                  margin: '0',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {summary.length > 300 ? summary.substring(0, 300) + '...' : summary}
              </p>
            </div>
          )}

          {/* Question */}
          {question && (
            <div
              style={{
                fontSize: '14px',
                color: '#64748b',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              "{question.length > 100 ? question.substring(0, 100) + '...' : question}"
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            hybridus-tarot.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
