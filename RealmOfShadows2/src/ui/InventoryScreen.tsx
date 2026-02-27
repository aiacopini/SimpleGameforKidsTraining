import { useEffect } from 'react';
import { InventoryItemDef } from '../types';
import styles from './InventoryScreen.module.css';

interface Props {
  items: InventoryItemDef[];
  playerInventory: string[];
  onUseItem: (itemId: string) => void;
  onClose: () => void;
}

export function InventoryScreen({ items, playerInventory, onUseItem, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const ownedItems = items.filter(item => playerInventory.includes(item.id));

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Inventory</h2>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        {ownedItems.length === 0 ? (
          <div className={styles.emptyState}>
            Your inventory is empty.
          </div>
        ) : (
          <div className={styles.items}>
            {ownedItems.map(item => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <p className={styles.itemDesc}>{item.description}</p>
                </div>
                {item.usable && (
                  <button className={styles.useBtn} onClick={() => onUseItem(item.id)}>
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
