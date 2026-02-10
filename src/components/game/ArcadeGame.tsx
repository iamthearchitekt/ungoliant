
import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import './ArcadeGame.css';
import spoolSprite from '../../assets/spool_sprite.png';
import tankSprite from '../../assets/tank_sprite.png';
import webBg from '../../assets/web_bg.png';
import spiderGif from '../../assets/spider_sprite.gif';
import gameOverImg from '../../assets/game_over.png';
import gameTitleImg from '../../assets/game_title.png';
import gameMusic from '../../assets/game_music.wav';
import gameOverSound from '../../assets/game_over.wav';
import playerShotSound from '../../assets/player_shot.wav';
import spriteDeathSound from '../../assets/sprite_death.wav';
import levelUpSound from '../../assets/new_level.wav';

interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    vx: number;
    vy: number;
    health?: number;
    type?: 'normal' | 'tank';
}

interface GameState {
    score: number;
    level: number;
    meter: number; // 0-100
    isGameOver: boolean;
    isGameStarted: boolean;
}

const PLAYER_SPEED = 7;
const PROJECTILE_SPEED = 12;
const SHOOT_COOLDOWN = 150; // ms
const ENEMY_BASE_SPEED = 1.5;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;

export const ArcadeGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerDomRef = useRef<HTMLDivElement>(null);

    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        level: 1,
        meter: 0,
        isGameOver: false,
        isGameStarted: false
    });

    // Game Loop Refs
    const playerRef = useRef<Entity>({
        x: CANVAS_WIDTH / 2 - 42,
        y: CANVAS_HEIGHT - 94,
        width: 84,
        height: 84,
        color: '#00cc00',
        vx: 0,
        vy: 0
    });

    const projectilesRef = useRef<Entity[]>([]);
    const lastShotTimeRef = useRef<number>(0);

    const enemiesRef = useRef<Entity[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const animationFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const enemySpawnTimerRef = useRef<number>(0);

    // Assets
    const spoolImageRef = useRef<HTMLImageElement | null>(null);
    const tankImageRef = useRef<HTMLImageElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);

    // Audio Refs
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const shootSoundRef = useRef<HTMLAudioElement | null>(null);
    const deathSoundRef = useRef<HTMLAudioElement | null>(null);
    const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
    const levelUpSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const spool = new Image();
            spool.src = spoolSprite;
            spoolImageRef.current = spool;

            const tank = new Image();
            tank.src = tankSprite;
            tankImageRef.current = tank;

            const bg = new Image();
            bg.src = webBg;
            bgImageRef.current = bg;

            // Initialize Audio
            musicRef.current = new Audio(gameMusic);
            musicRef.current.loop = true;
            musicRef.current.volume = 0.4;

            shootSoundRef.current = new Audio(playerShotSound);
            shootSoundRef.current.volume = 0.3;

            deathSoundRef.current = new Audio(spriteDeathSound);
            deathSoundRef.current.volume = 0.4;

            gameOverSoundRef.current = new Audio(gameOverSound);
            gameOverSoundRef.current.volume = 0.5;

            levelUpSoundRef.current = new Audio(levelUpSound);
            levelUpSoundRef.current.volume = 0.5;
        }

        return () => {
            // Cleanup Audio
            if (musicRef.current) {
                musicRef.current.pause();
                musicRef.current.currentTime = 0;
            }
        };
    }, []);

    // Play Sound Helper (Clones for overlapping sounds)
    const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (audioRef.current) {
            const clone = audioRef.current.cloneNode() as HTMLAudioElement;
            clone.volume = audioRef.current.volume;
            clone.play().catch(() => { }); // Ignore interaction errors
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.code] = false;
    };

    const fireProjectile = (time: number) => {
        if (gameState.isGameOver || !gameState.isGameStarted) return;

        if (time - lastShotTimeRef.current >= SHOOT_COOLDOWN) {
            const p = playerRef.current;
            projectilesRef.current.push({
                x: p.x + p.width / 2 - 3,
                y: p.y,
                width: 6,
                height: 20,
                color: '#00ff00',
                vx: 0,
                vy: -PROJECTILE_SPEED
            });
            lastShotTimeRef.current = time;
            playSound(shootSoundRef);
        }
    };

    const spawnEnemy = () => {
        const isTank = Math.random() < 0.2; // 20% chance for tank
        const width = isTank ? 80 : 30; // Tank is wider
        const height = isTank ? 54 : 30;
        const padding = 40;
        const x = Math.random() * (CANVAS_WIDTH - width - padding * 2) + padding;

        const drift = (Math.random() - 0.5) * 0.5;
        const speed = isTank
            ? (ENEMY_BASE_SPEED + (gameState.level * 0.2)) * 0.7 // Tanks are slower
            : ENEMY_BASE_SPEED + (gameState.level * 0.2);

        enemiesRef.current.push({
            x,
            y: -height,
            width,
            height,
            color: '#ffffff',
            vx: drift,
            vy: speed,
            health: isTank ? 2 : 1,
            type: isTank ? 'tank' : 'normal'
        });
    };

    const update = (time: number, deltaTime: number) => {
        if (gameState.isGameOver || !gameState.isGameStarted) return;

        const player = playerRef.current;

        // Player Movement
        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
            player.x = Math.max(0, player.x - PLAYER_SPEED);
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
            player.x = Math.min(CANVAS_WIDTH - player.width, player.x + PLAYER_SPEED);
        }

        // Direct DOM Update
        if (playerDomRef.current) {
            playerDomRef.current.style.left = `${player.x}px`;
            playerDomRef.current.style.top = `${player.y}px`;
        }

        // Shooting
        if (keysRef.current['Space']) {
            fireProjectile(time);
        }

        // Projectiles
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
            const p = projectilesRef.current[i];
            p.y += p.vy;
            if (p.y < -20) {
                projectilesRef.current.splice(i, 1);
            }
        }

        // Spawning
        enemySpawnTimerRef.current += deltaTime;
        if (enemySpawnTimerRef.current > Math.max(400, 1500 - (gameState.level * 100))) {
            spawnEnemy();
            enemySpawnTimerRef.current = 0;
        }

        // Enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
            const enemy = enemiesRef.current[i];
            enemy.y += enemy.vy;
            enemy.x += enemy.vx;

            if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
                enemy.vx *= -1;
            }

            if (enemy.y > CANVAS_HEIGHT) {
                handleGameOver();
                return;
            }

            // Collision
            let hit = false;
            for (let j = projectilesRef.current.length - 1; j >= 0; j--) {
                const proj = projectilesRef.current[j];
                if (checkCollision(proj, enemy)) {
                    projectilesRef.current.splice(j, 1);

                    if (enemy.health) enemy.health--;

                    if (!enemy.health || enemy.health <= 0) {
                        enemiesRef.current.splice(i, 1);
                        hit = true;
                        playSound(deathSoundRef);

                        setGameState(prev => {
                            const points = enemy.type === 'tank' ? 50 : 10;
                            const meterGain = enemy.type === 'tank' ? 15 : 5;
                            const newMeter = prev.meter + meterGain;

                            if (newMeter >= 100) {
                                playSound(levelUpSoundRef);
                                return {
                                    ...prev,
                                    score: prev.score + points + 100, // Bonus for level clear
                                    level: prev.level + 1,
                                    meter: 0
                                };
                            }
                            return {
                                ...prev,
                                score: prev.score + points,
                                meter: newMeter
                            };
                        });
                    } else {
                        // Optional: play a minor hit sound or visual effect here
                        // For now, just continue
                    }

                    break;
                }
            }
            if (hit) continue;
        }
    };

    const handleGameOver = () => {
        setGameState(prev => ({ ...prev, isGameOver: true }));
        if (musicRef.current) {
            musicRef.current.pause();
            musicRef.current.currentTime = 0;
        }
        playSound(gameOverSoundRef);
    };

    const checkCollision = (a: Entity, b: Entity) => {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.strokeStyle = '#22c55e'; // Our Green
        ctx.globalAlpha = 0.05; // Even fainter
        ctx.lineWidth = 1;

        const cellSize = 50;

        // Vertical lines
        for (let x = 0; x <= CANVAS_WIDTH; x += cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= CANVAS_HEIGHT; y += cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }

        // Diagonal lines for "3D" slicer feel
        ctx.globalAlpha = 0.02;
        for (let i = -CANVAS_HEIGHT; i <= CANVAS_WIDTH; i += cellSize * 1.5) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + CANVAS_HEIGHT, CANVAS_HEIGHT);
            ctx.stroke();
        }

        ctx.restore();
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Background image
        if (bgImageRef.current && bgImageRef.current.complete && bgImageRef.current.naturalWidth > 0) {
            const bgW = bgImageRef.current.width;
            const bgH = bgImageRef.current.height;
            const scale = CANVAS_WIDTH / bgW;
            const drawH = bgH * scale;

            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.drawImage(bgImageRef.current, 0, CANVAS_HEIGHT - drawH, CANVAS_WIDTH, drawH);
            ctx.restore();
        } else {
            // Fallback
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, CANVAS_HEIGHT - 100);
            ctx.lineTo(100, CANVAS_HEIGHT);
            ctx.moveTo(CANVAS_WIDTH, CANVAS_HEIGHT - 100);
            ctx.lineTo(CANVAS_WIDTH - 100, CANVAS_HEIGHT);
            ctx.stroke();
        }

        // Draw Slicer Grid over the background
        drawGrid(ctx);

        if (!gameState.isGameStarted) return;

        // Projectiles
        ctx.fillStyle = '#00ff00';
        projectilesRef.current.forEach(p => {
            ctx.fillRect(p.x, p.y, p.width, p.height);
        });

        // Enemies
        enemiesRef.current.forEach(e => {
            let img = spoolImageRef.current;
            if (e.type === 'tank' && tankImageRef.current) {
                img = tankImageRef.current;
            }

            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, e.x, e.y, e.width, e.height);
            } else {
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x, e.y, e.width, e.height);
            }
        });
    };

    const loop = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        update(time, deltaTime);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) draw(ctx);
        }

        if (!gameState.isGameOver) {
            animationFrameRef.current = requestAnimationFrame(loop);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        animationFrameRef.current = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [gameState.isGameOver, gameState.level, gameState.isGameStarted]);

    const handleStartGame = () => {
        setGameState(prev => ({ ...prev, isGameStarted: true }));
        if (musicRef.current) {
            musicRef.current.currentTime = 0;
            musicRef.current.play().catch(() => { });
        }
    };

    const handleRestart = () => {
        enemiesRef.current = [];
        projectilesRef.current = [];
        playerRef.current.x = CANVAS_WIDTH / 2 - 42;

        setGameState({
            score: 0,
            level: 1,
            meter: 0,
            isGameOver: false,
            isGameStarted: true
        });

        if (musicRef.current) {
            musicRef.current.currentTime = 0;
            musicRef.current.play().catch(() => { });
        }

        lastTimeRef.current = performance.now();
    };

    // Stop music when closing modal
    const handleClose = () => {
        if (musicRef.current) {
            musicRef.current.pause();
        }
        onClose();
    };

    return (
        <div className="arcade-overlay">
            <div className="arcade-container">
                <div className="arcade-header">
                    <div className="score">SCORE: {gameState.score.toString().padStart(6, '0')}</div>
                    <div className="level">LVL {gameState.level}</div>
                    <div className="meter-container">
                        <div className="meter-bar" style={{ width: `${gameState.meter}%` }} />
                    </div>
                    <button className="close-btn" onClick={handleClose}><X size={24} /></button>
                </div>

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="game-canvas"
                />

                {/* Player Overlay */}
                {gameState.isGameStarted && (
                    <div
                        ref={playerDomRef}
                        className="player-sprite"
                        style={{
                            position: 'absolute',
                            left: CANVAS_WIDTH / 2 - 42,
                            top: CANVAS_HEIGHT - 94,
                            width: 84,
                            height: 84,
                            pointerEvents: 'none',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <img
                            src={spiderGif}
                            alt="Spider"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                )}

                {/* Start Screen */}
                {!gameState.isGameStarted && !gameState.isGameOver && (
                    <div className="game-over-screen" style={{ background: 'rgba(0,0,0,0.9)' }}>
                        <img
                            src={gameTitleImg}
                            alt="FILAMENT FIGHT"
                            style={{
                                width: '90%',
                                maxWidth: '550px',
                                marginBottom: '20px',
                                imageRendering: 'pixelated'
                            }}
                        />
                        <div style={{ textAlign: 'center', marginBottom: '30px', color: '#ccc', fontSize: '18px' }}>
                            <p style={{ margin: '10px 0', fontFamily: "'Press Start 2P', cursive", fontSize: '14px', color: '#888' }}>CONTROLS</p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <ArrowLeft color="#00ff00" size={24} />
                                    <ArrowRight color="#00ff00" size={24} />
                                    <strong>MOVE</strong> (Arrow Keys)
                                </li>
                                <li>SPACE <strong>SHOOT</strong> (Rapid Fire)</li>
                            </ul>
                        </div>
                        <button onClick={handleStartGame} className="restart-btn" style={{ zIndex: 10 }}>START GAME</button>

                        {/* Web Graphic at Bottom */}
                        <img
                            src={webBg}
                            alt=""
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                opacity: 0.6,
                                pointerEvents: 'none',
                                zIndex: 0
                            }}
                        />
                    </div>
                )}

                {/* Game Over Screen */}
                {gameState.isGameOver && (
                    <div className="game-over-screen">
                        <img
                            src={gameOverImg}
                            alt="GAME OVER"
                            style={{
                                width: '80%',
                                maxWidth: '500px',
                                marginBottom: '20px',
                                imageRendering: 'pixelated'
                            }}
                        />
                        <p>SCORE: {gameState.score}</p>
                        <button onClick={handleRestart} className="restart-btn">TRY AGAIN</button>
                    </div>
                )}

                {/* Controls */}
                {gameState.isGameStarted && !gameState.isGameOver && (
                    <div className="arcade-controls">
                        <button
                            className="control-btn left"
                            onMouseDown={() => { keysRef.current['ArrowLeft'] = true; }}
                            onMouseUp={() => { keysRef.current['ArrowLeft'] = false; }}
                            onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = true; }}
                            onTouchEnd={() => { keysRef.current['ArrowLeft'] = false; }}
                        >
                            ←
                        </button>
                        <button
                            className="control-btn fire"
                            onMouseDown={() => { keysRef.current['Space'] = true; }}
                            onMouseUp={() => { keysRef.current['Space'] = false; }}
                            onTouchStart={(e) => { e.preventDefault(); keysRef.current['Space'] = true; }}
                            onTouchEnd={() => { keysRef.current['Space'] = false; }}
                        >
                            FIRE
                        </button>
                        <button
                            className="control-btn right"
                            onMouseDown={() => { keysRef.current['ArrowRight'] = true; }}
                            onMouseUp={() => { keysRef.current['ArrowRight'] = false; }}
                            onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = true; }}
                            onTouchEnd={() => { keysRef.current['ArrowRight'] = false; }}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
