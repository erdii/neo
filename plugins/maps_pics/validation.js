module.exports = {
    validateCoord,
    validateType,
    validateLatLonType,
};

const coordValidationRegex = /^[-+]?[0-9]*\.?[0-9]+$/;
const typeValidationRegex = /^(roadmap|satellite|hybrid|terrain)$/;

function validateCoord(coord) {
    return coordValidationRegex.test(coord);
}

function validateType(type) {
    return typeValidationRegex.test(type);
}

function validateLatLonType(lat, lon, type) {
    const validationErrors = [];

    if (!validateCoord(lat)) {
        validationErrors.push("lat is not a floating point number");
    }

    if (!validateCoord(lon)) {
        validationErrors.push("lon is not a floating point number");
    }

    if (!validateType(type)) {
        validationErrors.push("type is incorrect (roadmap|satellite|hybrid|terrain)");
    }

    return validationErrors;
}