import React from 'react';
import {Button, TextStyle} from '@shopify/polaris';
import {EmbedMinor, DeleteMinor} from '@shopify/polaris-icons';

import styles from './CardList.css';

export default function CardList({ headers, items } = props) {
  return (
    <div className="CardList">
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => <th key={`Card__Header_${index}`}><TextStyle variation="strong">{header}</TextStyle></th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item, itemIndex) => {
            return (
              <tr key={`Item_${itemIndex}`}>
                {item.values.map((value, valueIndex) => <td key={`Item_${itemIndex}_${valueIndex}`}><TextStyle variation="subdued">{value}</TextStyle></td>)}
                <td>
                  <div className="CardList-buttons">
                    <Button plain icon={EmbedMinor} onClick={item.onEdit}></Button>
                    <Button plain icon={DeleteMinor} onClick={item.onRemove}></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
