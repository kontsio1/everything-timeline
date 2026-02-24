import './Header.css';

export const Header = () => {
    return (
        <>

            <header className="App-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: '28px 48px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(15,14,11,0.92)',
                backdropFilter: 'blur(12px)',
            }}>
                <div className="logo" style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                }}>
                    <span className="logo-word" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '22px',
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        color: '#f5f0e8',
                    }}>Kontsio's</span>

                    <div className="logo-dot" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#c45c2e',
                        marginBottom: '3px',
                    }}></div>

                    <span className="logo-sub" style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '10px',
                        color: '#9aa5b4',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}>Timeline of Everything</span>
                </div>

                <div className="controls" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: "1vw",
                    marginBottom: 10
                }}>
                    <div className="db-select" style={{position: 'relative'}}>
                        <select className="db-select-dropdown">
                            <option>UK History</option>
                            <option>World History</option>
                            <option>Ancient Civilizations</option>
                            <option>Science &amp; Discovery</option>
                            <option>Art &amp; Culture</option>
                        </select>
                    </div>

                    <div className="search-wrap" style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <input type="text" placeholder="Search events…" defaultValue="Arrival of St Augustine"/>
                        <span className="search-icon" style={{
                            position: 'absolute',
                            right: '12px',
                            color: '#9aa5b4',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'color 0.2s',
                        }}>⌕</span>
                    </div>

                    <button className="add-btn" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        background: '#c45c2e',
                        color: '#fff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '6px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s, transform 0.1s',
                        letterSpacing: '0.2px',
                    }}>
                        <span>＋</span> Add Event
                    </button>
                </div>
            </header>
        </>
    );
};