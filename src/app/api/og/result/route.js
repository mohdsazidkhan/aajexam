import { ImageResponse } from 'next/og';

export const runtime = 'edge';

function clamp(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const rank = searchParams.get('rank') || '';
  const total = searchParams.get('total') || '';
  const score = searchParams.get('score') || '0';
  const accuracy = searchParams.get('accuracy') || '0';
  const pct = searchParams.get('pct') || '';
  const testTitle = clamp(searchParams.get('testTitle') || 'Mock Test', 64);
  const userName = clamp(searchParams.get('user') || 'AajExam Aspirant', 28);

  const pctNum = parseFloat(pct) || 0;
  const band = pctNum >= 99 ? 'TOP 1%'
    : pctNum >= 95 ? 'TOP 5%'
    : pctNum >= 90 ? 'TOP 10%'
    : pctNum >= 75 ? 'TOP 25%'
    : pctNum >= 50 ? 'TOP 50%'
    : 'RISING STAR';

  const bandColor = pctNum >= 90 ? '#fbbf24' : pctNum >= 75 ? '#a78bfa' : pctNum >= 50 ? '#60a5fa' : '#94a3b8';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)',
          fontFamily: 'system-ui, sans-serif',
          color: '#f8fafc',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#3b82f6', letterSpacing: '-1px' }}>AajExam</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', padding: '6px 14px', border: '1px solid #334155', borderRadius: '999px', letterSpacing: '2px' }}>RESULT</div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: bandColor, padding: '10px 20px', border: `2px solid ${bandColor}`, borderRadius: '999px', letterSpacing: '3px' }}>{band}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '36px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8', letterSpacing: '4px' }}>{userName.toUpperCase()} SCORED</div>
          <div style={{ fontSize: clamp(testTitle, 40).length > 28 ? '44px' : '56px', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-1.5px' }}>{testTitle}</div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          {rank && total && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px', background: 'rgba(251, 191, 36, 0.12)', border: '2px solid rgba(251, 191, 36, 0.4)', borderRadius: '28px' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#fbbf24', letterSpacing: '3px', marginBottom: '8px' }}>ALL INDIA RANK</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <div style={{ fontSize: '68px', fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-2px' }}>#{rank}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#cbd5e1' }}>of {Number(total).toLocaleString('en-IN')}</div>
              </div>
            </div>
          )}
          {pct && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px', background: 'rgba(139, 92, 246, 0.12)', border: '2px solid rgba(139, 92, 246, 0.4)', borderRadius: '28px' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#a78bfa', letterSpacing: '3px', marginBottom: '8px' }}>PERCENTILE</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <div style={{ fontSize: '68px', fontWeight: 900, color: '#a78bfa', lineHeight: 1, letterSpacing: '-2px' }}>{pctNum.toFixed(1)}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#cbd5e1' }}>Beat {pctNum.toFixed(0)}%</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid #334155', borderRadius: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', letterSpacing: '3px', marginBottom: '6px' }}>SCORE</div>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{score}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid #334155', borderRadius: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', letterSpacing: '3px', marginBottom: '6px' }}>ACCURACY</div>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{parseFloat(accuracy).toFixed(0)}%</div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', left: '80px', right: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', color: '#64748b', fontWeight: 700 }}>Beat this score on aajexam.com</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#3b82f6', letterSpacing: '3px' }}>SSC · RRB · BANKING · STATE POLICE</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
