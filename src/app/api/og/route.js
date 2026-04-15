import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'AajExam';
  const description = searchParams.get('desc') || 'Government Exam Preparation Platform';
  const type = searchParams.get('type') || 'page';

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
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
            maxWidth: '100%',
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#3b82f6',
                letterSpacing: '-1px',
              }}
            >
              AajExam
            </div>
            {type !== 'page' && (
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginLeft: '16px',
                  padding: '4px 12px',
                  border: '1px solid #334155',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {type}
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 60 ? '36px' : '48px',
              fontWeight: 800,
              color: '#f8fafc',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '900px',
              marginBottom: '20px',
            }}
          >
            {title.length > 80 ? title.slice(0, 80) + '...' : title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: '700px',
            }}
          >
            {description.length > 120 ? description.slice(0, 120) + '...' : description}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '16px', color: '#64748b' }}>
            aajexam.com — SSC | UPSC | Banking | Railway
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
