'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 卡牌类型
type CardType = '🐱' | '🐶' | '🐰' | '🐼' | '🐨' | '🐯' | '🦁' | '🐸' | '🐵' | '🐔';

interface GameCard {
  id: string;
  type: CardType;
  x: number;
  y: number;
  zIndex: number;
  isRevealed: boolean;
}

interface GameProps {
  onClose: () => void;
}

const CARD_TYPES: CardType[] = ['🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔'];

export default function Match3Game({ onClose }: GameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu');
  const [level, setLevel] = useState<1 | 2>(1);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [slotCards, setSlotCards] = useState<GameCard[]>([]);
  const [setAsideCards, setSetAsideCards] = useState<GameCard[]>([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canRevive, setCanRevive] = useState(true);
  
  // 道具状态
  const [hasSetAside, setHasSetAside] = useState(true);
  const [hasAutoClear, setHasAutoClear] = useState(true);
  const [hasShuffle, setHasShuffle] = useState(true);

  // 游戏次数系统
  const [gameCount, setGameCount] = useState(3);
  const [nextRecoveryTime, setNextRecoveryTime] = useState<number | null>(null);
  const [timeUntilRecovery, setTimeUntilRecovery] = useState<number | null>(null);

  // 检查并恢复游戏次数
  const checkAndRecoverGameCount = useCallback(() => {
    const now = Date.now();
    const lastPlayTime = localStorage.getItem('match3_last_play_time');
    const lastRefreshDate = localStorage.getItem('match3_last_refresh_date');
    const today = new Date().toDateString();

    // 每天刷新到3次
    if (lastRefreshDate !== today) {
      localStorage.setItem('match3_last_refresh_date', today);
      localStorage.setItem('match3_game_count', '3');
      setGameCount(3);
      setNextRecoveryTime(null);
      return;
    }

    // 每60分钟恢复一次
    if (lastPlayTime) {
      const lastPlayTimeNum = parseInt(lastPlayTime, 10);
      const elapsedMinutes = Math.floor((now - lastPlayTimeNum) / (1000 * 60));
      const currentCount = parseInt(localStorage.getItem('match3_game_count') || '3', 10);
      
      if (currentCount < 3 && elapsedMinutes >= 60) {
        const recoveredCount = Math.min(3, currentCount + Math.floor(elapsedMinutes / 60));
        localStorage.setItem('match3_game_count', String(recoveredCount));
        setGameCount(recoveredCount);
        
        // 计算下一次恢复时间
        if (recoveredCount < 3) {
          const nextRecovery = lastPlayTimeNum + (Math.floor(elapsedMinutes / 60) + 1) * 60 * 1000;
          setNextRecoveryTime(nextRecovery);
        } else {
          setNextRecoveryTime(null);
        }
      }
    }
  }, []);

  // 初始化游戏次数
  useEffect(() => {
    const savedCount = localStorage.getItem('match3_game_count');
    const lastPlayTime = localStorage.getItem('match3_last_play_time');
    
    if (savedCount) {
      setGameCount(parseInt(savedCount, 10));
    }
    
    if (lastPlayTime) {
      const lastPlayTimeNum = parseInt(lastPlayTime, 10);
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - lastPlayTimeNum) / (1000 * 60));
      
      if (elapsedMinutes >= 60 && parseInt(savedCount || '3', 10) < 3) {
        setNextRecoveryTime(lastPlayTimeNum + 60 * 1000);
      }
    }
    
    checkAndRecoverGameCount();

    // 每分钟检查一次恢复时间
    const interval = setInterval(checkAndRecoverGameCount, 60000);
    
    // 每秒更新倒计时显示
    const timerInterval = setInterval(() => {
      if (nextRecoveryTime) {
        const remaining = Math.max(0, Math.ceil((nextRecoveryTime - Date.now()) / 60000));
        setTimeUntilRecovery(remaining);
      } else {
        setTimeUntilRecovery(null);
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [checkAndRecoverGameCount, nextRecoveryTime]);

  // 使用游戏次数
  const useGameCount = () => {
    if (gameCount > 0) {
      const newCount = gameCount - 1;
      localStorage.setItem('match3_game_count', String(newCount));
      localStorage.setItem('match3_last_play_time', String(Date.now()));
      setGameCount(newCount);
      
      if (newCount < 3) {
        setNextRecoveryTime(Date.now() + 60 * 1000);
      }
    }
  };

  // 计算奖励金币
  const calculateRewardCoins = (progressValue: number): number => {
    if (progressValue >= 100) return 100;
    if (progressValue >= 80) return 80;
    if (progressValue >= 70) return 70;
    if (progressValue >= 60) return 60;
    return 10;
  };

  // 生成游戏关卡
  const generateLevel = useCallback((targetLevel: 1 | 2) => {
    const cardCount = targetLevel === 1 ? 15 : 25;
    const types = targetLevel === 1 ? CARD_TYPES.slice(0, 5) : CARD_TYPES;
    
    const newCards: GameCard[] = [];
    const cols = targetLevel === 1 ? 3 : 5;
    
    for (let i = 0; i < cardCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      newCards.push({
        id: `${i}-${Date.now()}-${Math.random()}`,
        type,
        x: i % cols,
        y: Math.floor(i / cols),
        zIndex: Math.floor(i / cols),
        isRevealed: true
      });
    }
    
    setCards(newCards);
    setSlotCards([]);
    setSetAsideCards([]);
    setScore(0);
    setProgress(0);
  }, []);

  // 点击卡牌
  const handleCardClick = (card: GameCard) => {
    if (gameState !== 'playing') return;
    if (slotCards.length >= 7) return;

    // 移除桌面上的卡牌
    setCards(prev => prev.filter(c => c.id !== card.id));
    
    // 添加到插槽
    setSlotCards(prev => [...prev, card]);
    
    // 检查消除
    setTimeout(() => checkForMatch([...slotCards, card]), 0);
  };

  // 检查消除
  const checkForMatch = (currentSlot: GameCard[]) => {
    const typeCount = new Map<CardType, GameCard[]>();
    
    currentSlot.forEach(card => {
      if (!typeCount.has(card.type)) {
        typeCount.set(card.type, []);
      }
      typeCount.get(card.type)!.push(card);
    });

    let newSlot = [...currentSlot];
    let foundMatch = false;

    typeCount.forEach((cards, type) => {
      if (cards.length >= 3) {
        // 找到三张相同的，消除它们
        const cardsToRemove = cards.slice(0, 3);
        newSlot = newSlot.filter(c => !cardsToRemove.some(r => r.id === c.id));
        foundMatch = true;
        
        // 增加分数
        setScore(prev => prev + 100);
        
        // 计算进度
        const totalCards = level === 1 ? 15 : 25;
        const remainingCards = cards.length + setAsideCards.length;
        const currentProgress = Math.round(((totalCards - remainingCards) / totalCards) * 100);
        setProgress(currentProgress);
      }
    });

    setSlotCards(newSlot);
    
    // 检查游戏结束
    if (newSlot.length >= 7) {
      if (canRevive && level === 1) {
        setGameState('gameover');
      } else if (cards.length === 0 && newSlot.length < 7) {
        setGameState('victory');
      } else {
        setGameState('gameover');
      }
    } else if (cards.length === 0 && newSlot.length < 7) {
      setGameState('victory');
    }
  };

  // 放置一旁道具
  const handleSetAside = () => {
    if (!hasSetAside || slotCards.length === 0) return;
    
    const cardsToSetAside = slotCards.slice(0, 3);
    setSetAsideCards(prev => [...prev, ...cardsToSetAside]);
    setSlotCards(prev => prev.slice(3));
    setHasSetAside(false);
  };

  // 自动清除道具
  const handleAutoClear = () => {
    if (!hasAutoClear || slotCards.length < 3) return;
    
    const typeCount = new Map<CardType, GameCard[]>();
    slotCards.forEach(card => {
      if (!typeCount.has(card.type)) {
        typeCount.set(card.type, []);
      }
      typeCount.get(card.type)!.push(card);
    });

    for (const [type, cards] of typeCount.entries()) {
      if (cards.length >= 3) {
        const cardsToRemove = cards.slice(0, 3);
        setSlotCards(prev => prev.filter(c => !cardsToRemove.some(r => r.id === c.id)));
        setHasAutoClear(false);
        setScore(prev => prev + 50);
        break;
      }
    }
  };

  // 洗牌道具
  const handleShuffle = () => {
    if (!hasShuffle) return;
    
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((card, index) => ({
      ...card,
      x: index % (level === 1 ? 3 : 5),
      y: Math.floor(index / (level === 1 ? 3 : 5))
    })));
    setHasShuffle(false);
  };

  // 复活
  const handleRevive = () => {
    if (!canRevive) return;
    
    setSetAsideCards(prev => [...prev, ...slotCards]);
    setSlotCards([]);
    setCanRevive(false);
    setGameState('playing');
  };

  // 开始游戏
  const handleStartGame = () => {
    if (gameCount <= 0) {
      alert('今日游戏次数已用完！请等待60分钟后恢复次数。');
      return;
    }
    
    useGameCount();
    setLevel(1);
    generateLevel(1);
    setCanRevive(true);
    setHasSetAside(true);
    setHasAutoClear(true);
    setHasShuffle(true);
    setGameState('playing');
  };

  // 重新开始
  const handleRestart = () => {
    if (gameCount <= 0) {
      alert('今日游戏次数已用完！请等待60分钟后恢复次数。');
      return;
    }
    useGameCount();
    setLevel(1);
    generateLevel(1);
    setCanRevive(true);
    setHasSetAside(true);
    setHasAutoClear(true);
    setHasShuffle(true);
    setGameState('playing');
  };

  // 下一关
  const handleNextLevel = () => {
    setLevel(2);
    generateLevel(2);
    setHasSetAside(true);
    setHasAutoClear(true);
    setHasShuffle(true);
    setGameState('playing');
  };

  // 返回菜单
  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎮 三消游戏
          </CardTitle>
          <Button variant="outline" onClick={onClose} className="rounded-full w-10 h-10 p-0">
            ✕
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* 菜单界面 */}
          {gameState === 'menu' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">欢迎来到三消游戏</h2>
                <p className="text-gray-600 max-w-md">
                  找出三张相同的卡牌并消除，插槽最多放7张牌。<br />
                  放满7张牌游戏结束，通关可获得奖励！
                </p>
              </div>
              
              {/* 游戏次数显示 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 w-full max-w-md">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-600">剩余游戏次数：</span>
                    <span className="font-bold text-purple-600">{gameCount}</span>
                    <span className="text-gray-600">/3</span>
                  </div>
                  {gameCount < 3 && timeUntilRecovery !== null && (
                    <div className="text-xs text-gray-500">
                      下次恢复：{timeUntilRecovery} 分钟后
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleStartGame}
                disabled={gameCount <= 0}
                className="w-full max-w-xs h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameCount <= 0 ? '次数已用完' : '开始游戏'}
              </Button>
            </div>
          )}

          {/* 游戏进行中 */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="space-y-4">
              {/* 游戏信息 */}
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">关卡：</span>
                    <span className="font-bold text-purple-600">{level}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">分数：</span>
                    <span className="font-bold text-pink-600">{score}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">进度：</span>
                    <span className="font-bold text-amber-600">{progress}%</span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleBackToMenu} size="sm">
                  返回菜单
                </Button>
              </div>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 游戏区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 卡牌区域 */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200 min-h-[300px]">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">卡牌区域</h3>
                  <div 
                    className="relative"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${level === 1 ? 3 : 5}, 1fr)`,
                      gap: '8px',
                      minHeight: '200px'
                    }}
                  >
                    {cards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className="text-4xl sm:text-5xl p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 hover:border-purple-400 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        style={{
                          position: 'relative',
                          zIndex: card.zIndex
                        }}
                      >
                        {card.type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 插槽区域 */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      插槽区域 ({slotCards.length}/7)
                    </h3>
                    <div className="flex gap-2 flex-wrap min-h-[80px] p-2 bg-gray-50 rounded-lg">
                      {slotCards.map(card => (
                        <span
                          key={card.id}
                          className="text-3xl p-2 bg-white rounded border border-gray-300"
                        >
                          {card.type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 放置一旁区域 */}
                  {setAsideCards.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-amber-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        放置一旁 ({setAsideCards.length})
                      </h3>
                      <div className="flex gap-2 flex-wrap p-2 bg-gray-50 rounded-lg">
                        {setAsideCards.map(card => (
                          <span
                            key={card.id}
                            className="text-3xl p-2 bg-white rounded border border-gray-300"
                          >
                            {card.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 道具按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSetAside}
                      disabled={!hasSetAside || slotCards.length === 0}
                      className="flex-1 text-sm"
                    >
                      📦 放置一旁{!hasSetAside && '(已用)'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAutoClear}
                      disabled={!hasAutoClear || slotCards.length < 3}
                      className="flex-1 text-sm"
                    >
                      ✨ 自动清除{!hasAutoClear && '(已用)'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShuffle}
                      disabled={!hasShuffle}
                      className="flex-1 text-sm"
                    >
                      🔄 洗牌{!hasShuffle && '(已用)'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 游戏结束 */}
          {gameState === 'gameover' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-8xl">😢</div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">游戏结束</h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">通关进度：{progress}%</p>
              </div>

              {canRevive && level === 1 && (
                <Button
                  onClick={handleRevive}
                  className="w-full max-w-xs h-12 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  💪 复活继续
                </Button>
              )}

              <div className="flex gap-3 w-full max-w-xs">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  disabled={gameCount <= 0}
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  重新开始
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToMenu}
                  className="flex-1"
                >
                  返回菜单
                </Button>
              </div>
            </div>
          )}

          {/* 游戏胜利 */}
          {gameState === 'victory' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-8xl">🎉</div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  {level === 1 ? '第一关完成！' : '恭喜通关！'}
                </h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">通关进度：{progress}%</p>
              </div>

              {level === 1 ? (
                <Button
                  onClick={handleNextLevel}
                  className="w-full max-w-xs h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  下一关
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200">
                    <h3 className="text-xl font-bold text-amber-700 mb-2">🎁 奖励</h3>
                    <p className="text-gray-700">
                      恭喜通关！您已获得以下奖励：<br />
                      🪙 <span className="font-bold text-amber-600">{calculateRewardCoins(progress)}</span> 枚金币
                    </p>
                  </div>
                  <div className="flex gap-3 w-full max-w-xs">
                    <Button
                      variant="outline"
                      onClick={handleRestart}
                      disabled={gameCount <= 0}
                      className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      重新开始
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBackToMenu}
                      className="flex-1"
                    >
                      返回菜单
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
