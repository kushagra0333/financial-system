
import random
import csv
import datetime
import os

def generate_sample_data(output_file='sample_data/synthetic_transactions.csv', num_transactions=5000):
    """
    Generates synthetic transaction data with specific fraud patterns and legitimate traps.
    """
    
    # Configuration
    start_date = datetime.datetime.now() - datetime.timedelta(days=7)
    
    transactions = []
    transaction_id = 1
    
    # Helper to add txn
    def add_txn(sender, receiver, amount, timestamp=None):
        nonlocal transaction_id
        if timestamp is None:
            # Random time in last 7 days
            delta = datetime.timedelta(minutes=random.randint(0, 7*24*60))
            timestamp = start_date + delta
            
        transactions.append({
            'transaction_id': f"TXN_{transaction_id:05d}",
            'sender_id': sender,
            'receiver_id': receiver,
            'amount': round(amount, 2),
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
        transaction_id += 1

    # --- 1. Fraud Rings: Cycles ---
    # Cycle 1 (Length 3): MULE_A -> MULE_B -> MULE_C -> MULE_A
    print("Generating Cycles...")
    mules_cycle = ['MULE_C1', 'MULE_C2', 'MULE_C3']
    base_time = start_date + datetime.timedelta(days=1)
    for i in range(len(mules_cycle)):
        s = mules_cycle[i]
        r = mules_cycle[(i+1) % len(mules_cycle)]
        add_txn(s, r, 5000 + random.uniform(-100, 100), base_time + datetime.timedelta(minutes=i*30))

    # --- 2. Smurfing (Fan-In -> Aggregator -> Fan-Out) ---
    # Many small depositors -> SMURF_AGG -> Many withdrawal accounts
    print("Generating Smurfing...")
    aggregator = 'SMURF_AGG'
    num_leaves = 15
    base_time_smurf = start_date + datetime.timedelta(days=2)
    
    # Fan-In (Placement)
    for i in range(num_leaves):
        sender = f"DEPOSITOR_{i}"
        add_txn(sender, aggregator, 900 + random.uniform(-50, 50), base_time_smurf + datetime.timedelta(minutes=random.randint(0, 60)))
        
    # Fan-Out (Layering) - Shortly after
    for i in range(num_leaves):
        receiver = f"WITHDRAWAL_{i}"
        add_txn(aggregator, receiver, 850 + random.uniform(-50, 50), base_time_smurf + datetime.timedelta(hours=2, minutes=random.randint(0, 60)))

    # --- 3. Shell Chains ---
    # SOURCE -> SHELL_1 -> SHELL_2 -> SHELL_3 -> SINK
    print("Generating Shell Chains...")
    chain = ['SHELL_SRC', 'SHELL_1', 'SHELL_2', 'SHELL_3', 'SHELL_DST']
    base_time_shell = start_date + datetime.timedelta(days=3)
    for i in range(len(chain)-1):
        add_txn(chain[i], chain[i+1], 10000, base_time_shell + datetime.timedelta(hours=i*4))


    # --- 4. Legitimate Traps ---
    
    # Merchant (High Fan-In, Low Out, High Balance Accumulation)
    # Many customers -> MERCHANT
    print("Generating Merchant...")
    merchant = 'LEGIT_MERCHANT'
    num_customers = 50
    for i in range(num_customers):
        cust = f"CUSTOMER_{i}"
        # Small random purchases
        add_txn(cust, merchant, random.uniform(20, 200))
        
    # Merchant might pay a few suppliers or rent (Low Fan-Out)
    add_txn(merchant, 'SUPPLIER_A', 5000)
    add_txn(merchant, 'LANDLORD', 2000)


    # Payroll (High Fan-Out, Low In, High Balance Depletion)
    # FUNDING_SOURCE -> COMPANY_PAYROLL -> EMPLOYEES
    print("Generating Payroll...")
    payroll = 'LEGIT_PAYROLL'
    funding = 'BIG_CORP_MAIN'
    
    # One huge deposit in
    add_txn(funding, payroll, 200000, start_date + datetime.timedelta(days=4))
    
    # Many payouts
    num_employees = 40
    for i in range(num_employees):
        emp = f"EMPLOYEE_{i}"
        add_txn(payroll, emp, 4000 + random.uniform(-500, 500), start_date + datetime.timedelta(days=4, hours=2))


    # --- 5. Background Noise ---
    # Random low-value transactions between random people
    print("Generating Background Noise...")
    entities = [f"USER_{i}" for i in range(100)]
    for _ in range(num_transactions - len(transactions)):
        s = random.choice(entities)
        r = random.choice(entities)
        while s == r:
            r = random.choice(entities)
        add_txn(s, r, random.uniform(10, 500))

    # Save to CSV
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for txn in transactions:
            writer.writerow(txn)
            
    print(f"Generated {len(transactions)} transactions in {output_file}")


if __name__ == "__main__":
    generate_sample_data()
