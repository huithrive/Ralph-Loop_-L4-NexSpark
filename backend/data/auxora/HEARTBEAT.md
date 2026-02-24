# Auxora Heartbeat Routine

Every 30 minutes, check:
1. Pull latest metrics from all active campaigns
2. Evaluate optimizer rules against thresholds
3. Check budget pacing (daily/weekly)
4. Detect anomalies (CPA spikes, CTR drops, frequency fatigue)
5. Check milestone progress (ROAS targets, revenue goals)
6. Generate action cards for any triggered rules
7. Auto-execute L1 actions, queue L2/L3 for approval
8. Log everything to daily memory file

Special triggers:
- T+48h post-launch: First 48h report
- Monday 9 AM: Weekly report
- 1st of month: Monthly report
- Phase boundary: Transition check
