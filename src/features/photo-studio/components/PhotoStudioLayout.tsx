import type { ReactNode } from 'react';

type Props = {
  topBar: ReactNode;
  leftPanel: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  mobileTabs?: ReactNode;
};

export default function PhotoStudioLayout({ topBar, leftPanel, canvas, rightPanel, mobileTabs }: Props) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {topBar}
      {mobileTabs}
      <div className="flex flex-1 flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {leftPanel}
        {canvas}
        {rightPanel}
      </div>
    </div>
  );
}
