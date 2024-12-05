function calculateAverageInvestedAmountByAge(data) {
    const customerData = {};

    data.forEach((item) => {
        if (!customerData[item.age]) {
            customerData[item.age] = { total: 0, count: 0 };
        }
        customerData[item.age].total += item.amount_invested_monthly;
        customerData[item.age].count += 1;
    });

    return Object.keys(customerData).map((age) => ({
        age,
        average_amount_invested: customerData[age].total / customerData[age].count,
    }));
};

export default calculateAverageInvestedAmountByAge;