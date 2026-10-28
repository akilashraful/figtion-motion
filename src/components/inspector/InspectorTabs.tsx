import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { DesignPanel } from './DesignPanel';
import { AnimatePanel } from './AnimatePanel';

// Design / Animate segmented switch, as in the original inspector
export const InspectorTabs: React.FC = () => {
  const trigger =
    'flex-1 py-[11px] text-sm font-semibold bg-[#f1f1f4] text-[var(--mute)] first:rounded-l-md last:rounded-r-md data-[state=active]:bg-[#17181c] data-[state=active]:text-white outline-none';
  return (
    <aside className="h-full w-full bg-white border-l border-[var(--line)] flex flex-col overflow-hidden select-none">
      <Tabs.Root defaultValue="design" className="flex-1 flex flex-col min-h-0">
        <Tabs.List className="flex px-[14px] py-3 shrink-0">
          <Tabs.Trigger value="design" className={trigger}>Design</Tabs.Trigger>
          <Tabs.Trigger value="animate" className={trigger}>Animate</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="design" className="flex-1 overflow-y-auto px-4 outline-none">
          <DesignPanel />
        </Tabs.Content>
        <Tabs.Content value="animate" className="flex-1 overflow-y-auto px-4 outline-none">
          <AnimatePanel />
        </Tabs.Content>
      </Tabs.Root>
    </aside>
  );
};
