import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'system_guardian'))
from guardian_agent import get_guardian

agent = get_guardian()
print("Collecting metrics...")
agent.collect_metrics()
print("Generating report...")
filename = agent.generate_pdf_report()
print(f"Report generated: {filename}")
print(f"File exists: {os.path.exists(filename)}")
