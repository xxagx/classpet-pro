#!/usr/bin/env python3
"""
进度反馈工具
"""

import time
import threading
from datetime import datetime

class ProgressReporter:
    """进度报告器"""
    
    def __init__(self, task_name: str, total_steps: int = 1):
        self.task_name = task_name
        self.total_steps = total_steps
        self.current_step = 0
        self.start_time = time.time()
        self.last_report_time = 0
        self.report_interval = 30  # 每30秒报告一次
        self._stop_event = threading.Event()
        self._thread = None
    
    def start(self):
        """开始任务，启动进度报告线程"""
        print(f"\n🚀 开始任务: {self.task_name}")
        print(f"   预计步骤: {self.total_steps} 步")
        print(f"   开始时间: {datetime.now().strftime('%H:%M:%S')}")
        
        # 启动后台报告线程
        self._thread = threading.Thread(target=self._report_loop)
        self._thread.daemon = True
        self._thread.start()
    
    def _report_loop(self):
        """后台报告循环"""
        while not self._stop_event.is_set():
            time.sleep(5)  # 每5秒检查一次
            elapsed = time.time() - self.start_time
            
            # 每30秒报告一次进度
            if elapsed - self.last_report_time >= self.report_interval:
                self._report_progress()
                self.last_report_time = elapsed
    
    def _report_progress(self):
        """报告当前进度"""
        elapsed = time.time() - self.start_time
        progress_pct = (self.current_step / self.total_steps * 100) if self.total_steps > 0 else 0
        
        print(f"\n⏱️  [{self.task_name}] 进度更新")
        print(f"   已用时间: {int(elapsed)}秒")
        print(f"   当前步骤: {self.current_step}/{self.total_steps} ({progress_pct:.0f}%)")
    
    def step(self, step_name: str = ""):
        """完成一步"""
        self.current_step += 1
        step_info = f" - {step_name}" if step_name else ""
        print(f"\n✅ 步骤 {self.current_step}/{self.total_steps}{step_info}")
    
    def finish(self, success: bool = True):
        """完成任务"""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=1)
        
        elapsed = time.time() - self.start_time
        status = "✅ 完成" if success else "❌ 失败"
        
        print(f"\n{status}: {self.task_name}")
        print(f"   总用时: {int(elapsed)}秒")
        print(f"   完成时间: {datetime.now().strftime('%H:%M:%S')}")

# 便捷函数
def report_start(task_name: str, steps: int = 1) -> ProgressReporter:
    """开始报告"""
    reporter = ProgressReporter(task_name, steps)
    reporter.start()
    return reporter
