'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 卡牌类型 - 使用可爱的动物图标
type CardType = '🐱' | '🐶' | '🐰' | '🐼' | '🐨' | '🐯' | '🦁' | '🐸' | '🐵' | '🐔';

interface GameCard {
  id: string;
  type: CardType;
  x: number;
  y: number;
  z: number; // 层级，从下往上
  isBlocked: boolean; // 是否被完全遮挡
  isPartiallyBlocked: boolean; // 是否部分被遮挡
}

interface GameProps {
  onClose: () => void;
}

const CARD_TYPES: CardType[] = ['🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔'];

export default function CatteaGame({ onClose }: GameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'victory'>('menu');
  const [level, setLevel] = useState<1 | 2>(1);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [slotCards, setSlotCards] = useState<GameCard[]>([]);
  const [setAsideCards, setSetAsideCards] = useState<GameCard[]>([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canRevive, setCanRevive] = useState(true);
  const [totalCards, setTotalCards] = useState(0);
  
  // 道具状态
  const [hasSetAside, setHasSetAside] = useState(true);
  const [hasAutoClear, setHasAutoClear] = useState(true);
  const [hasShuffle, setHasShuffle] = useState(true);

  // 游戏次数系统
  const [gameCount, setGameCount] = useState(3);
  const [nextRecoveryTime, setNextRecoveryTime] = useState<number | null>(null);
  const [timeUntilRecovery, setTimeUntilRecovery] = useState<number | null>(null);

  // 生成关卡 - 第一关简单，第二关困难
  const generateLevel = useCallback((targetLevel: 1 | 2) => {
    const isLevel1 = targetLevel === 1;
    
    // 第一关：21张卡（7组，每组3张）
    // 第二关：36张卡（9组，每组4张）
    const totalCardCount = isLevel1 ? 21 : 36;
    const groupCount = isLevel1 ? 7 : 9;
    const cardsPerGroup = isLevel1 ? 3 : 4;
    const types = isLevel1 ? CARD_TYPES.slice(0, 5) : CARD_TYPES;
    
    const newCards: GameCard[] = [];
    const cardWidth = 60; // 卡牌宽度
    const cardHeight = 70; // 卡牌高度
    
    // 生成卡牌堆叠
    for (let group = 0; group < groupCount; group++) {
      const type = types[group % types.length];
      
      for (let i = 0; i < cardsPerGroup; i++) {
        // 使用网格布局，模拟堆叠效果
        // 第一关：3x7 网格，第二关：4x9 网格
        const gridCols = isLevel1 ? 3 : 4;
        const gridRows = Math.ceil(groupCount / gridCols);
        
        // 计算基础位置
        const groupRow = Math.floor(group / gridCols);
        const groupCol = group % gridCols;
        
        const baseX = groupCol * (cardWidth + 5);
        const baseY = groupRow * (cardHeight + 5);
        
        // 添加随机偏移，形成堆叠
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        newCards.push({
          id: `card-${group}-${i}-${Date.now()}-${Math.random()}`,
          type,
          x: Math.round(baseX + offsetX),
          y: Math.round(baseY + offsetY),
          z: i, // 层级
          isBlocked: false,
          isPartiallyBlocked: false
        });
      }
    }
    
    // 计算遮挡关系
    const calculatedCards = calculateCardBlocking(newCards, cardWidth, cardHeight);
    
    setCards(calculatedCards);
    setTotalCards(totalCardCount);
    setSlotCards([]);
    setSetAsideCards([]);
    setScore(0);
    setProgress(0);
  }, []);

  // 计算卡牌遮挡关系
  const calculateCardBlocking = (cardsList: GameCard[], cardWidth: number, cardHeight: number): GameCard[] => {
    const updatedCards = cardsList.map(card => ({
      ...card,
      isBlocked: false,
      isPartiallyBlocked: false
    }));

    // 按层级排序（从上到下）
    const sortedCards = [...updatedCards].sort((a, b) => b.z - a.z);

    for (let i = 0; i < sortedCards.length; i++) {
      const upperCard = sortedCards[i];
      
      for (let j = i + 1; j < sortedCards.length; j++) {
        const lowerCard = sortedCards[j];
        
        // 检查水平重叠
        const overlapArea = calculateOverlapArea(upperCard, lowerCard, cardWidth, cardHeight);
        const lowerArea = cardWidth * cardHeight;
        
        // 如果上层卡牌完全覆盖下层卡牌
        if (overlapArea >= lowerArea * 0.7) {
          lowerCard.isBlocked = true;
        }
        // 如果上层卡牌部分覆盖下层卡牌
        else if (overlapArea >= lowerArea * 0.2) {
          lowerCard.isPartiallyBlocked = true;
        }
      }
    }

    return updatedCards;
  };

  // 计算两张卡牌的重叠面积
  const calculateOverlapArea = (card1: GameCard, card2: GameCard, width: number, height: number): number => {
    const xOverlap = Math.max(0, Math.min(card1.x + width, card2.x + width) - Math.max(card1.x, card2.x));
    const yOverlap = Math.max(0, Math.min(card1.y + height, card2.y + height) - Math.max(card1.y, card2.y));
    return xOverlap * yOverlap;
  };

  // 检查卡牌是否可点击（未遮挡且是最上层）
  const isCardClickable = useCallback((card: GameCard): boolean => {
    if (card.isBlocked) return false;
    
    // 检查上方是否有其他卡牌遮挡
    for (const otherCard of cards) {
      if (otherCard.id === card.id) continue;
      if (otherCard.z <= card.z) continue;
      
      const overlapArea = calculateOverlapArea(otherCard, card, 60, 70);
      if (overlapArea > 0) {
        return false;
      }
    }
    
    return true;
  }, [cards]);

  // 点击卡牌
  const handleCardClick = (card: GameCard) => {
    if (gameState !== 'playing') return;
    if (slotCards.length >= 7) return;
    if (!isCardClickable(card)) return;

    // 从桌面上移除卡牌
    setCards(prev => {
      const newCards = prev.filter(c => c.id !== card.id);
      // 重新计算遮挡关系
      return calculateCardBlocking(newCards, 60, 70);
    });
    
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
        const currentProgress = totalCards > 0 ? Math.round(((totalCards - cards.length - newSlot.length) / totalCards) * 100) : 100;
        setProgress(currentProgress);
      }
    });

    setSlotCards(newSlot);
    
    // 检查游戏结束
    if (newSlot.length >= 7) {
      if (canRevive && level === 1) {
        setGameState('gameover');
      } else {
        setGameState('gameover');
      }
    } else if (cards.length === 0 && newSlot.length < 7) {
      if (level === 1) {
        // 第一关完成，进入第二关
        setTimeout(() => {
          setLevel(2);
          generateLevel(2);
          setHasSetAside(true);
          setHasAutoClear(true);
          setHasShuffle(true);
        }, 1000);
      } else {
        setGameState('victory');
      }
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
    
    setCards(prev => {
      const shuffled = [...prev];
      shuffled.forEach(card => {
        // 保持z不变，只改变x, y
        const cardWidth = 60;
        const cardHeight = 70;
        const gridCols = level === 1 ? 3 : 4;
        const gridRows = Math.ceil(shuffled.length / gridCols);
        
        card.x = Math.random() * (gridCols * (cardWidth + 5) - cardWidth);
        card.y = Math.random() * (gridRows * (cardHeight + 5) - cardHeight);
      });
      
      return calculateCardBlocking(shuffled, 60, 70);
    });
    
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

  // 计算奖励金币
  const calculateRewardCoins = (progressValue: number): number => {
    if (progressValue >= 100) return 100;
    if (progressValue >= 80) return 80;
    if (progressValue >= 70) return 70;
    if (progressValue >= 60) return 60;
    return 10;
  };

  // 检查并恢复游戏次数
  const checkAndRecoverGameCount = useCallback(() => {
    const now = Date.now();
    const lastPlayTime = localStorage.getItem('cattea_last_play_time');
    const lastRefreshDate = localStorage.getItem('cattea_last_refresh_date');
    const today = new Date().toDateString();

    if (lastRefreshDate !== today) {
      localStorage.setItem('cattea_last_refresh_date', today);
      localStorage.setItem('cattea_game_count', '3');
      setGameCount(3);
      setNextRecoveryTime(null);
      return;
    }

    if (lastPlayTime) {
      const lastPlayTimeNum = parseInt(lastPlayTime, 10);
      const elapsedMinutes = Math.floor((now - lastPlayTimeNum) / (1000 * 60));
      const currentCount = parseInt(localStorage.getItem('cattea_game_count') || '3', 10);
      
      if (currentCount < 3 && elapsedMinutes >= 60) {
        const recoveredCount = Math.min(3, currentCount + Math.floor(elapsedMinutes / 60));
        localStorage.setItem('cattea_game_count', String(recoveredCount));
        setGameCount(recoveredCount);
        
        if (recoveredCount < 3) {
          const nextRecovery = lastPlayTimeNum + (Math.floor(elapsedMinutes / 60) + 1) * 60 * 1000;
          setNextRecoveryTime(nextRecovery);
        } else {
          setNextRecoveryTime(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    const savedCount = localStorage.getItem('cattea_game_count');
    const lastPlayTime = localStorage.getItem('cattea_last_play_time');
    
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

    const interval = setInterval(checkAndRecoverGameCount, 60000);
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

  const useGameCount = () => {
    if (gameCount > 0) {
      const newCount = gameCount - 1;
      localStorage.setItem('cattea_game_count', String(newCount));
      localStorage.setItem('cattea_last_play_time', String(Date.now()));
      setGameCount(newCount);
      
      if (newCount < 3) {
        setNextRecoveryTime(Date.now() + 60 * 1000);
      }
    }
  };

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

  const handleRestart = () => {
    if (gameCount <= 0) {
      alert('今日游戏次数已用完！请等待60分钟后恢复次数。');
      return;
    }
    useGameCount();
    handleStartGame();
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto bg-gradient-to-br from-amber-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold text-amber-800">
            🐱 Cattea 三消
          </CardTitle>
          <Button variant="outline" onClick={onClose} className="rounded-full w-8 h-8 p-0 text-sm">
            ✕
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {gameState === 'menu' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-center space-y-3">
                <div className="text-6xl">🐱</div>
                <h2 className="text-2xl font-bold text-amber-800">Cattea</h2>
                <p className="text-gray-600 text-sm max-w-xs">
                  找出三张相同的卡牌并消除<br />
                  插槽最多放7张牌
                </p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-lg w-full max-w-xs">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">剩余次数：</span>
                  <span className="font-bold text-amber-700">{gameCount}/3</span>
                  {gameCount < 3 && timeUntilRecovery !== null && (
                    <span className="text-xs text-gray-500">
                      {timeUntilRecovery}分钟后恢复
                    </span>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleStartGame}
                disabled={gameCount <= 0}
                className="w-full max-w-xs h-12 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameCount <= 0 ? '次数已用完' : 'START 开始游戏'}
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-600">关卡：<span className="font-bold text-amber-700">{level}</span></span>
                  <span className="text-gray-600">分数：<span className="font-bold text-amber-700">{score}</span></span>
                </div>
                <span className="text-gray-600">进度：<span className="font-bold text-amber-700">{progress}%</span></span>
              </div>

              <div className="w-full bg-amber-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="bg-white rounded-lg p-3 border-2 border-amber-300 min-h-[300px] relative overflow-hidden">
                <div 
                  className="relative"
                  style={{
                    width: '100%',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '8px'
                  }}
                >
                  {cards.map(card => {
                    const clickable = isCardClickable(card);
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        disabled={!clickable}
                        className="absolute transition-all duration-200 cursor-pointer"
                        style={{
                          left: `${card.x}px`,
                          top: `${card.y}px`,
                          width: '60px',
                          height: '70px',
                          zIndex: card.z,
                          opacity: card.isBlocked ? 0.3 : card.isPartiallyBlocked ? 0.6 : 1,
                          pointerEvents: clickable ? 'auto' : 'none',
                          transform: clickable ? 'scale(1)' : 'scale(0.95)'
                        }}
                      >
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white transition-transform hover:scale-105"
                          style={{
                            background: clickable ? 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)' : '#f3f4f6',
                            boxShadow: clickable 
                              ? `0 ${card.z * 2 + 2}px ${card.z * 4 + 4}px rgba(245, 158, 11, 0.3), inset 0 1px 2px rgba(255,255,255,0.8)`
                              : 'none'
                          }}
                        >
                          {card.type}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border-2 border-amber-300">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  插槽 ({slotCards.length}/7)
                </div>
                <div className="flex gap-2 flex-wrap min-h-[60px] p-2 bg-amber-50 rounded-lg">
                  {slotCards.map(card => (
                    <span
                      key={card.id}
                      className="text-3xl w-12 h-14 flex items-center justify-center bg-white rounded-lg shadow border border-amber-200"
                    >
                      {card.type}
                    </span>
                  ))}
                </div>
              </div>

              {setAsideCards.length > 0 && (
                <div className="bg-white rounded-lg p-3 border-2 border-amber-300">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    放置一旁 ({setAsideCards.length})
                  </div>
                  <div className="flex gap-2 flex-wrap p-2 bg-amber-50 rounded-lg">
                    {setAsideCards.map(card => (
                      <span
                        key={card.id}
                        className="text-2xl w-10 h-12 flex items-center justify-center bg-white rounded border border-gray-300"
                      >
                        {card.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSetAside}
                  disabled={!hasSetAside || slotCards.length === 0}
                  className="flex-1 text-sm bg-amber-50 border-amber-300 hover:bg-amber-100"
                >
                  📦 放置
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAutoClear}
                  disabled={!hasAutoClear || slotCards.length < 3}
                  className="flex-1 text-sm bg-amber-50 border-amber-300 hover:bg-amber-100"
                >
                  ✨ 清除
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShuffle}
                  disabled={!hasShuffle}
                  className="flex-1 text-sm bg-amber-50 border-amber-300 hover:bg-amber-100"
                >
                  🔄 洗牌
                </Button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-6xl">😢</div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">游戏结束</h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">完成进度：{progress}%</p>
              </div>

              {canRevive && (
                <Button
                  onClick={handleRevive}
                  className="w-full max-w-xs h-11 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  💪 复活继续
                </Button>
              )}

              <div className="flex gap-2 w-full max-w-xs">
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

          {gameState === 'victory' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-6xl">🎉</div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">恭喜通关！</h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">完成进度：{progress}%</p>
              </div>

              <div className="text-center space-y-3 w-full">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-300">
                  <h3 className="text-lg font-bold text-amber-700 mb-2">🎁 奖励</h3>
                  <p className="text-gray-700">
                    🪙 <span className="font-bold text-amber-600">{calculateRewardCoins(progress)}</span> 枚金币
                  </p>
                </div>
                <div className="flex gap-2 w-full max-w-xs mx-auto">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
