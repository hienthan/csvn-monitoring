import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface AppShellProps {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Debug utility to find horizontal overflow culprits
    const checkOverflow = () => {
      const doc = document.documentElement;
      if (doc.scrollWidth > doc.clientWidth) {
        console.warn(`[DEBUG] Horizontal overflow detected! scrollWidth: ${doc.scrollWidth}, clientWidth: ${doc.clientWidth}`);

        const elements = document.querySelectorAll('body *');
        const candidates: any[] = [];

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (el.scrollWidth > el.clientWidth || rect.right > doc.clientWidth + 1) {
            candidates.push({
              element: el,
              tagName: el.tagName,
              className: el.className,
              rectWidth: rect.width,
              rectRight: rect.right,
              domPath: getDomPath(el)
            });
          }
        });

        console.table(candidates.slice(0, 5));
      } else {
        console.log('[DEBUG] No horizontal overflow detected.');
      }
    };

    function getDomPath(el: Element) {
      const stack = [];
      let current: Element | null = el;
      while (current && current.parentNode) {
        let sibCount = 0;
        let sibIndex = 0;
        for (let i = 0; i < current.parentNode.children.length; i++) {
          const sib = current.parentNode.children[i] as Element;
          if (sib.nodeName === current.nodeName) {
            if (sib === current) sibIndex = sibCount;
            sibCount++;
          }
        }
        if (current.hasAttribute('id') && current.id != '') {
          stack.unshift(current.nodeName.toLowerCase() + '#' + current.id);
        } else if (sibCount > 1) {
          stack.unshift(current.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
          stack.unshift(current.nodeName.toLowerCase());
        }
        current = current.parentElement;
      }
      return stack.join(' > ');
    }

    // Run after a short delay to ensure content is rendered
    const timer = setTimeout(checkOverflow, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell

