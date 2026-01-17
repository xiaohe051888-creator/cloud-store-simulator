'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 方块类型
type BlockType = '🔴' | '🟡' | '🟢' | '🔵' | '🟣' | '🟠' | '⚪' | '⚫';

interface Block3D {
  id: string;
  type: BlockType;
  x: number; // 水平位置
  y: number; // 垂直位置
  z: number; // 层级
  size: number; // 方块大小
  isBlocked: boolean; // 是否被遮挡
  isPartiallyBlocked: boolean; // 是否部分被遮挡
}

interface GameProps {
  onClose: () => void;
}

const BLOCK_TYPES: BlockType[] = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠', '⚪', '⚫'];

export default function Match3Game3D({ onClose }: GameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu');
  const [blocks, setBlocks] = useState<Block3D[]>([]);
  const [slotBlocks, setSlotBlocks] = useState<BlockType[]>([]);
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

  // 生成3D关卡
  const generateLevel = useCallback((targetLevel: 1 | 2) => {
    const blockCount = targetLevel === 1 ? 21 : 36; // 7组×3 或 9组×4
    const types = targetLevel === 1 ? BLOCK_TYPES.slice(0, 5) : BLOCK_TYPES;
    const groupsCount = targetLevel === 1 ? 7 : 9; // 7组每组3个 或 9组每组4个
    const blocksPerGroup = targetLevel === 1 ? 3 : 4;
    
    const newBlocks: Block3D[] = [];
    const gridSize = targetLevel === 1 ? 3 : 4;
    const baseSize = 70; // 方块基础大小

    // 生成金字塔式堆叠
    for (let group = 0; group < groupsCount; group++) {
      const type = types[group % types.length];
      
      for (let i = 0; i < blocksPerGroup; i++) {
        // 使用螺旋式放置，形成3D堆叠
        const angle = (group / groupsCount) * Math.PI * 2 + (i * 0.3);
        const radius = (i + 1) * 15; // 每层向外扩展
        
        const centerX = (gridSize - 1) * baseSize / 2;
        const centerY = (gridSize - 1) * baseSize / 2;
        
        const x = Math.floor(centerX + Math.cos(angle) * radius - baseSize / 2);
        const y = Math.floor(centerY + Math.sin(angle) * radius - baseSize / 2);
        
        // 限制在网格内
        const clampedX = Math.max(0, Math.min((gridSize - 1) * baseSize - baseSize, x));
        const clampedY = Math.max(0, Math.min((gridSize - 1) * baseSize - baseSize, y));
        
        newBlocks.push({
          id: `block-${group}-${i}-${Date.now()}-${Math.random()}`,
          type,
          x: clampedX,
          y: clampedY,
          z: i, // 层级，从下往上
          size: baseSize,
          isBlocked: false,
          isPartiallyBlocked: false
        });
      }
    }

    // 计算遮挡关系
    const calculatedBlocks = calculateBlockBlocking(newBlocks);
    
    setBlocks(calculatedBlocks);
    setSlotBlocks([]);
    setScore(0);
    setProgress(0);
  }, []);

  // 计算方块之间的遮挡关系
  const calculateBlockBlocking = (blocksList: Block3D[]): Block3D[] => {
    const updatedBlocks = blocksList.map(block => ({
      ...block,
      isBlocked: false,
      isPartiallyBlocked: false
    }));

    // 对方块按层级排序（从上到下）
    const sortedBlocks = [...updatedBlocks].sort((a, b) => b.z - a.z);

    for (let i = 0; i < sortedBlocks.length; i++) {
      const upperBlock = sortedBlocks[i];
      
      for (let j = i + 1; j < sortedBlocks.length; j++) {
        const lowerBlock = sortedBlocks[j];
        
        // 检查是否在同一垂直投影区域内
        const horizontalOverlap = checkOverlap(upperBlock, lowerBlock);
        
        if (horizontalOverlap) {
          // 计算重叠面积
          const overlapArea = calculateOverlapArea(upperBlock, lowerBlock);
          const upperArea = upperBlock.size * upperBlock.size;
          const lowerArea = lowerBlock.size * lowerBlock.size;
          
          // 如果上层方块完全覆盖下层方块
          if (overlapArea >= lowerArea * 0.8) {
            lowerBlock.isBlocked = true;
          }
          // 如果上层方块部分覆盖下层方块
          else if (overlapArea >= lowerArea * 0.3) {
            lowerBlock.isPartiallyBlocked = true;
          }
        }
      }
    }

    return updatedBlocks;
  };

  // 检查两个方块是否在水平面上重叠
  const checkOverlap = (block1: Block3D, block2: Block3D): boolean => {
    return !(block1.x + block1.size <= block2.x ||
             block2.x + block2.size <= block1.x ||
             block1.y + block1.size <= block2.y ||
             block2.y + block2.size <= block1.y);
  };

  // 计算两个方块的重叠面积
  const calculateOverlapArea = (block1: Block3D, block2: Block3D): number => {
    const xOverlap = Math.max(0, Math.min(block1.x + block1.size, block2.x + block2.size) - Math.max(block1.x, block2.x));
    const yOverlap = Math.max(0, Math.min(block1.y + block1.size, block2.y + block2.size) - Math.max(block1.y, block2.y));
    return xOverlap * yOverlap;
  };

  // 检查方块是否可以点击（未被遮挡且是最上层）
  const isBlockClickable = useCallback((block: Block3D): boolean => {
    if (block.isBlocked) return false;
    
    // 检查上方是否有其他方块遮挡
    for (const otherBlock of blocks) {
      if (otherBlock.id === block.id) continue;
      if (otherBlock.z <= block.z) continue;
      
      const horizontalOverlap = checkOverlap(otherBlock, block);
      if (horizontalOverlap) {
        return false;
      }
    }
    
    return true;
  }, [blocks]);

  // 点击方块
  const handleBlockClick = (block: Block3D) => {
    if (gameState !== 'playing') return;
    if (slotBlocks.length >= 7) return;
    if (!isBlockClickable(block)) return;

    // 移除桌面上的方块
    setBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== block.id);
      // 重新计算遮挡关系
      return calculateBlockBlocking(newBlocks);
    });
    
    // 添加到插槽
    setSlotBlocks(prev => [...prev, block.type]);
    
    // 检查消除
    setTimeout(() => checkForMatch([...slotBlocks, block.type]), 0);
  };

  // 检查消除
  const checkForMatch = (currentSlot: BlockType[]) => {
    const typeCount = new Map<BlockType, number>();
    
    currentSlot.forEach(block => {
      typeCount.set(block, (typeCount.get(block) || 0) + 1);
    });

    let newSlot = [...currentSlot];
    let foundMatch = false;

    typeCount.forEach((count, type) => {
      if (count >= 3) {
        // 找到三个相同的，消除它们
        for (let i = 0; i < 3; i++) {
          const index = newSlot.indexOf(type);
          if (index > -1) {
            newSlot.splice(index, 1);
          }
        }
        foundMatch = true;
        
        // 增加分数
        setScore(prev => prev + 100);
        
        // 计算进度
        const totalBlocks = blocks.length;
        const currentProgress = totalBlocks > 0 ? Math.round(((totalBlocks - blocks.length + 1) / totalBlocks) * 100) : 100;
        setProgress(currentProgress);
      }
    });

    setSlotBlocks(newSlot);
    
    // 检查游戏结束
    if (newSlot.length >= 7) {
      if (canRevive && gameState === 'playing') {
        setGameState('gameover');
      } else {
        setGameState('gameover');
      }
    } else if (blocks.length === 0 && newSlot.length < 7) {
      setGameState('victory');
    }
  };

  // 放置一旁道具
  const handleSetAside = () => {
    if (!hasSetAside || slotBlocks.length === 0) return;
    
    const blocksToSetAside = slotBlocks.slice(0, 3);
    setSlotBlocks(prev => prev.slice(3));
    setHasSetAside(false);
  };

  // 自动清除道具
  const handleAutoClear = () => {
    if (!hasAutoClear || slotBlocks.length < 3) return;
    
    const typeCount = new Map<BlockType, number>();
    slotBlocks.forEach(block => {
      typeCount.set(block, (typeCount.get(block) || 0) + 1);
    });

    for (const [type, count] of typeCount.entries()) {
      if (count >= 3) {
        let removed = 0;
        setSlotBlocks(prev => {
          const newSlot = [...prev];
          for (let i = newSlot.length - 1; i >= 0 && removed < 3; i--) {
            if (newSlot[i] === type) {
              newSlot.splice(i, 1);
              removed++;
            }
          }
          return newSlot;
        });
        setHasAutoClear(false);
        setScore(prev => prev + 50);
        break;
      }
    }
  };

  // 洗牌道具
  const handleShuffle = () => {
    if (!hasShuffle) return;
    
    setBlocks(prev => {
      const shuffled = [...prev];
      shuffled.forEach(block => {
        // 保持z不变，只改变x, y
        const gridSize = shuffled.length <= 21 ? 3 : 4;
        const baseSize = 70;
        const centerX = (gridSize - 1) * baseSize / 2;
        const centerY = (gridSize - 1) * baseSize / 2;
        
        block.x = Math.random() * (gridSize * baseSize - baseSize);
        block.y = Math.random() * (gridSize * baseSize - baseSize);
      });
      
      return calculateBlockBlocking(shuffled);
    });
    
    setHasShuffle(false);
  };

  // 复活
  const handleRevive = () => {
    if (!canRevive) return;
    
    setSlotBlocks([]);
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
    const lastPlayTime = localStorage.getItem('match3_last_play_time');
    const lastRefreshDate = localStorage.getItem('match3_last_refresh_date');
    const today = new Date().toDateString();

    if (lastRefreshDate !== today) {
      localStorage.setItem('match3_last_refresh_date', today);
      localStorage.setItem('match3_game_count', '3');
      setGameCount(3);
      setNextRecoveryTime(null);
      return;
    }

    if (lastPlayTime) {
      const lastPlayTimeNum = parseInt(lastPlayTime, 10);
      const elapsedMinutes = Math.floor((now - lastPlayTimeNum) / (1000 * 60));
      const currentCount = parseInt(localStorage.getItem('match3_game_count') || '3', 10);
      
      if (currentCount < 3 && elapsedMinutes >= 60) {
        const recoveredCount = Math.min(3, currentCount + Math.floor(elapsedMinutes / 60));
        localStorage.setItem('match3_game_count', String(recoveredCount));
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
      localStorage.setItem('match3_game_count', String(newCount));
      localStorage.setItem('match3_last_play_time', String(Date.now()));
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
    generateLevel(1);
    setCanRevive(true);
    setHasSetAside(true);
    setHasAutoClear(true);
    setHasShuffle(true);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎮 3D方块消消乐
          </CardTitle>
          <Button variant="outline" onClick={onClose} className="rounded-full w-10 h-10 p-0">
            ✕
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {gameState === 'menu' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">欢迎来到3D方块消消乐</h2>
                <p className="text-gray-600 max-w-md">
                  点击可用的方块收集到插槽中，3个相同颜色的方块可以消除。<br />
                  下层的方块被上层遮挡时只能看到部分内容，消除上层方块才能完全显示下层方块！
                </p>
              </div>
              
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
                className="w-full max-w-xs h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameCount <= 0 ? '次数已用完' : '开始游戏'}
              </Button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">分数：</span>
                    <span className="font-bold text-blue-600">{score}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">进度：</span>
                    <span className="font-bold text-purple-600">{progress}%</span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleBackToMenu} size="sm">
                  返回菜单
                </Button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200 min-h-[400px] relative" style={{ perspective: '1000px' }}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">3D方块堆叠</h3>
                  <div 
                    className="relative"
                    style={{
                      width: '280px',
                      height: '280px',
                      margin: '0 auto',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {blocks.map(block => {
                      const clickable = isBlockClickable(block);
                      return (
                        <button
                          key={block.id}
                          onClick={() => handleBlockClick(block)}
                          disabled={!clickable}
                          className="absolute transition-all duration-300 cursor-pointer"
                          style={{
                            left: `${block.x}px`,
                            top: `${block.y}px`,
                            width: `${block.size}px`,
                            height: `${block.size}px`,
                            zIndex: block.z,
                            transform: `translateZ(${block.z * 20}px)`,
                            opacity: block.isBlocked ? 0.3 : block.isPartiallyBlocked ? 0.6 : 1,
                            pointerEvents: clickable ? 'auto' : 'none'
                          }}
                        >
                          <div
                            className="w-full h-full rounded-lg flex items-center justify-center text-4xl font-bold shadow-lg transition-transform hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                              boxShadow: clickable 
                                ? `0 ${block.z * 4 + 4}px ${block.z * 8 + 8}px rgba(0,0,0,${0.1 + block.z * 0.05}), inset 0 2px 4px rgba(255,255,255,0.5)`
                                : 'none',
                              border: block.isBlocked ? 'none' : '2px solid rgba(255,255,255,0.8)',
                              filter: clickable ? 'none' : 'grayscale(0.5)'
                            }}
                          >
                            {block.type}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      插槽区域 ({slotBlocks.length}/7)
                    </h3>
                    <div className="flex gap-2 flex-wrap min-h-[80px] p-2 bg-gray-50 rounded-lg">
                      {slotBlocks.map((block, index) => (
                        <span
                          key={index}
                          className="text-4xl p-2 bg-white rounded-lg shadow-md border-2 border-purple-200"
                        >
                          {block}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSetAside}
                      disabled={!hasSetAside || slotBlocks.length === 0}
                      className="flex-1 text-sm"
                    >
                      📦 放置一旁{!hasSetAside && '(已用)'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAutoClear}
                      disabled={!hasAutoClear || slotBlocks.length < 3}
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

          {gameState === 'gameover' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-8xl">😢</div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">游戏结束</h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">完成进度：{progress}%</p>
              </div>

              {canRevive && (
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

          {gameState === 'victory' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-8xl">🎉</div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">恭喜通关！</h2>
                <p className="text-gray-600">最终分数：{score}</p>
                <p className="text-gray-600">完成进度：{progress}%</p>
              </div>

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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
