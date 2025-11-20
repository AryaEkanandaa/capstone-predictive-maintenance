exports.detectAnomaly = (req, res) => {
    const sensorData = req.body;

    let isAnomaly = (sensorData.air_temperature > 300);

    const response = {
        timestamp: new Date().toISOString(),
        isAnomaly: isAnomaly,
        recommendation: isAnomaly ? 
            "Anomali terdeteksi. Perlu pemeriksaan." :
            "Mesin berjalan normal."
    };

    res.status(200).json(response);
};

exports.predictFailure = (req, res) => {
    res.status(501).send({ message: "Endpoint Prediksi Kegagalan belum diimplementasikan." });
};