import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: '#0f172a', // Slate-900
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '50%', // Circle
                    fontWeight: 900,
                    textShadow: '0 0 1px white',
                    position: 'relative',
                }}
            >
                <div style={{ position: 'relative', display: 'flex', marginRight: '4px', marginBottom: '4px' }}>
                    R
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '-6px',
                            width: '5px',
                            height: '5px',
                            background: '#60a5fa', // Blue-400
                        }}
                    />
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
