function calculateAverageInterestRateByAge(data) {
    const customerData = {};

    data.forEach((item) => {
        if (!customerData[item.age]) {
            customerData[item.age] = { total: 0, count: 0 };
        }
        customerData[item.age].total += item.interest_rate;
        customerData[item.age].count += 1;
    });

    return Object.keys(customerData).map((age) => ({
        age,
        average_interest_rate: customerData[age].total / customerData[age].count,
    }));
};

export default calculateAverageInterestRateByAge;