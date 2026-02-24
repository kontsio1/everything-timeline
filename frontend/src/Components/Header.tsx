export const Header = () => {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

                .db-select select {
                    appearance: none;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #f5f0e8;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    padding: 9px 36px 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .db-select select:hover { border-color: rgba(255,255,255,0.25); }
                .db-select select:focus { border-color: #b8963e; }
                .db-select select option { background: #0f0e0b; }

                .db-select::after {
                    content: '▾';
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9aa5b4;
                    pointer-events: none;
                    font-size: 12px;
                }

                .search-wrap input {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #f5f0e8;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    padding: 9px 40px 9px 14px;
                    border-radius: 6px;
                    width: 260px;
                    outline: none;
                    transition: border-color 0.2s, width 0.3s;
                }
                .search-wrap input::placeholder { color: #9aa5b4; }
                .search-wrap input:focus {
                    border-color: #b8963e;
                    width: 320px;
                    background: rgba(255,255,255,0.08);
                }

                .add-btn:hover { background: #d4683a !important; }
                .add-btn:active { transform: scale(0.97); }

                .search-icon:hover { color: #b8963e; }
            `}</style>

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
                    }}>Kontsio</span>

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
                    gap: '12px',
                }}>
                    <div className="db-select" style={{ position: 'relative' }}>
                        <select>
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
                        <input type="text" placeholder="Search events…" defaultValue="Arrival of St Augustine" />
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