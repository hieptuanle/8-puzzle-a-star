# 8-Puzzle Solver

Mô phỏng giải bài toán 8 ô số bằng thuật toán A\*.

Xem [Demo](https://8-puzzle-a-star.vercel.app/)

Các bước đi tiếp theo hiển thị trong `Priority Queue`, với bước đi có giá trị `f` nhỏ nhất sẽ được chọn để đi tiếp. Các nước đi mới được tạo ra ở lượt đi gần nhất sẽ có màu nền xanh lá cây.

Tất cả các trạng thái đã đi qua sẽ được lưu trữ trong `Visited States`.

## Yêu cầu

- NodeJS LTS
- Pnpm

## Cài đặt

```bash
pnpm install
```

## Chạy project

```bash
pnpm run dev
```

## Hàm heuristic

Thuật toán hàm heuristic có trong file `src/utils/puzzleUtils.ts`:

- Manhattan Distance
- Euclidean Distance (mặc định)
- Manhattan Distance + Linear Conflict (tối ưu nhất)

### Euclidean Distance

Khoảng cách Euclid là một hàm heuristic tính tổng khoảng cách đường thẳng (theo đường chéo) từ vị trí hiện tại của mỗi ô đến vị trí mục tiêu của nó.

```typescript
export const getEuclideanDistance = (board: number[][]): number => {
  let distance = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value = board[row][col];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.sqrt(
          Math.pow(row - targetRow, 2) + Math.pow(col - targetCol, 2)
        );
      }
    }
  }
  return distance;
};
```

### Manhattan Distance

Tổng khoảng cách mỗi ô cách vị trí mục tiêu của nó, đo bằng số bước lưới (lên, xuống, trái, phải).

```typescript
export const getManhattanDistance = (board: number[][]): number => {
  let distance = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value = board[row][col];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
      }
    }
  }
  return distance;
};
```

### Linear Conflict (Xung đột tuyến tính)

Một cải tiến của Khoảng cách Manhattan bằng cách thêm chi phí khi hai ô ở đúng hàng hoặc cột mục tiêu nhưng bị đảo ngược so với vị trí mục tiêu của chúng.

```typescript
export const getLinearConflict = (board: number[][]): number => {
  let conflict = 0;

  // Check rows for conflicts
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value1 = board[row][col];
      if (value1 === 0) continue;

      // Check if value1 belongs in this row
      const value1TargetRow = Math.floor((value1 - 1) / 3);
      if (value1TargetRow !== row) continue;

      // Compare with other tiles in the same row
      for (let col2 = col + 1; col2 < 3; col2++) {
        const value2 = board[row][col2];
        if (value2 === 0) continue;

        const value2TargetRow = Math.floor((value2 - 1) / 3);
        // If both tiles belong in this row and are in reverse order
        if (value2TargetRow === row && value1 > value2) {
          conflict += 2;
        }
      }
    }
  }

  // Check columns for conflicts
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const value1 = board[row][col];
      if (value1 === 0) continue;

      // Check if value1 belongs in this column
      const value1TargetCol = (value1 - 1) % 3;
      if (value1TargetCol !== col) continue;

      // Compare with other tiles in the same column
      for (let row2 = row + 1; row2 < 3; row2++) {
        const value2 = board[row2][col];
        if (value2 === 0) continue;

        const value2TargetCol = (value2 - 1) % 3;
        // If both tiles belong in this column and are in reverse order
        if (value2TargetCol === col && value1 > value2) {
          conflict += 2;
        }
      }
    }
  }

  return conflict;
};
```

---

## Các chú thích về template

### React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
