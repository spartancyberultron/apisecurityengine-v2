// Cipher suites check
async function checkCipherSuitesVulnerabilities(ssl2CipherSuites, ssl3CipherSuites,
    tls1CipherSuites, tls1_1CipherSuites, tls1_2CipherSuites, tls1_3CipherSuites) {


    const vulnerableCipherSuites = [
        "EXP-",      // Export-grade cipher suites
        "NULL-",     // Cipher suites with no encryption
        "RC4-",      // RC4 cipher suites
        "DES-",      // DES cipher suites
        "MD5",       // Cipher suites with MD5
        "aNULL",     // Anonymous cipher suites
        "eNULL"      // Null encryption cipher suites
    ];

    const checkVulnerabilities = (cipherSuites) => {
        if (!cipherSuites.result.is_tls_version_supported) {
            return false;
        }
        const acceptedCipherSuites = cipherSuites.result.accepted_cipher_suites || [];
        for (const suite of acceptedCipherSuites) {
            for (const vuln of vulnerableCipherSuites) {
                if (suite.cipher_suite.name.includes(vuln)) {
                    console.log(`Vulnerable Cipher Suite Detected: ${suite.cipher_suite.name}`);
                    return true;
                }
            }
        }
        return false;
    };

    return (
        checkVulnerabilities(ssl2CipherSuites) ||
        checkVulnerabilities(ssl3CipherSuites) ||
        checkVulnerabilities(tls1CipherSuites) ||
        checkVulnerabilities(tls1_1CipherSuites) ||
        checkVulnerabilities(tls1_2CipherSuites) ||
        checkVulnerabilities(tls1_3CipherSuites)
    );

}


// CRIME check
async function gettlsCompressionIssue(tlsCompression) {

    if (tlsCompression.resul && tlsCompression.result.supports_compression) {
        return true;
    } else {
        return false
    }

}

// TLS 1.3 early data
async function gettls13EarlyDataIssue(tls13EarlyData) {

    if (tls13EarlyData.result && tls13EarlyData.result.supports_early_data) {
        return true;
    } else {
        return false;
    }

}

// OpenSSL CCS Injection
async function getopenSSLCCSInjectionIssue(openSSLCCSInjection) {

    if (openSSLCCSInjection.result && openSSLCCSInjection.result.is_vulnerable_to_ccs_injection) {
        return true;
    } else {
        return false;
    }

}

// Downgrade prevention
async function gettlsFallbackSCSVIssue(tlsFallbackSCSV) {

    if (tlsFallbackSCSV.result && tlsFallbackSCSV.result.supports_fallback_scsv) {
        return true;
    } else {
        return false;
    }

}

// Heartbleed check
async function getheartbleedIssue(heartbleed) {

    if (heartbleed.result && heartbleed.result.is_vulnerable_to_heartbleed) {
        return true;
    } else {
        return false;
    }

}

async function getrobotIssue(robot) {

}

// Insecure renegotiation
async function getsessionRenegotiationIssue(sessionRenegotiation) {

    if (sessionRenegotiation.result && sessionRenegotiation.result.supports_secure_renegotiation) {
        return false;
    } else {
        return true;
    }

}

// Session resumption support
async function getsessionResumptionIssue(sessionResumption) {

    if (sessionResumption.result) {
        return true;
    } else {
        return false;
    }

}


// Supported elliptic curve
async function getellipticCurvesIssue(ellipticCurves) {

    console.log('data:', ellipticCurves)

    var data = ellipticCurves;

    const weakCurves = [
        "secp160k1", "secp160r1", "secp192k1", "secp192r1",
        "sect163k1", "sect163r1"
    ];

    if (!data || !data || !data.result) {
        throw new Error("Invalid input data");
    }

    const result = data.result;

    if (!result.supports_ecdh_key_exchange) {
        console.log("The server does not support ECDH key exchange.");
        return false;
    }

    const supportedCurves = result.supported_curves;
    const rejectedCurves = result.rejected_curves;

    if (supportedCurves && supportedCurves.length > 0) {
        console.log("Supported Elliptic Curves:");
        supportedCurves.forEach(curve => {
            console.log(`Curve: ${curve.name}, OpenSSL NID: ${curve.openssl_nid}`);
        });

        const vulnerableCurves = supportedCurves.filter(curve => weakCurves.includes(curve.name));

        if (vulnerableCurves.length > 0) {

            console.log("Vulnerable Elliptic Curves Detected:");
            vulnerableCurves.forEach(curve => {
                console.log(`Curve: ${curve.name}, OpenSSL NID: ${curve.openssl_nid}`);
            });
            return true;

        } else {

            console.log("No vulnerable elliptic curves detected.");
        }
    } else {

        console.log("No supported elliptic curves.");
    }

    if (rejectedCurves && rejectedCurves.length > 0) {

        console.log("Rejected Elliptic Curves:");
        rejectedCurves.forEach(curve => {
            console.log(`Curve: ${curve.name}, OpenSSL NID: ${curve.openssl_nid}`);
        });

    } else {
        console.log("No rejected elliptic curves.");
    }

    return false;

}


module.exports = {
    checkCipherSuitesVulnerabilities,
    gettlsCompressionIssue,
    gettls13EarlyDataIssue,
    getopenSSLCCSInjectionIssue,
    gettlsFallbackSCSVIssue,
    getheartbleedIssue,
    getrobotIssue,
    getsessionRenegotiationIssue,
    getsessionResumptionIssue,
    getellipticCurvesIssue,

};