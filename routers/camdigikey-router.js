const express = require('express')
const { CamDigiKeyClient } = require('camdigikey-client')

const router = express.Router();

router.post('/', async (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken || accessToken =='') {
    return res.status(400).json({ error: 'Invalid Access Token' })
  }
  
  try {
    return res.status(200).json(await CamDigiKeyClient.default.validateJwt(accessToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/user-face', async (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken || accessToken =='') {
    return res.status(400).json({ error: 'Invalid Access Token' })
  }
  
  try {
    return res.status(200).json(await CamDigiKeyClient.default.getUserFace(accessToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

function cleanQueryValue(value) {
  const raw = Array.isArray(value) ? value[value.length - 1] : value;
  if (typeof raw !== 'string') {
    return undefined;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

router.get('/login-token', async (req, res) => {
  const { successReturnUrl, errorReturnUrl, ...rest } = req.query;

  const callbackVars = {};
  for (const [key, value] of Object.entries(rest)) {
    const cleaned = cleanQueryValue(value);
    if (cleaned !== undefined) {
      callbackVars[key] = cleaned;
    }
  }

  const cleanSuccessReturnUrl = cleanQueryValue(successReturnUrl);
  const cleanErrorReturnUrl = cleanQueryValue(errorReturnUrl);

  try {
    return res.status(200).json(await CamDigiKeyClient.default.getLoginToken({
      ...(cleanSuccessReturnUrl && { successReturnUrl: cleanSuccessReturnUrl }),
      ...(cleanErrorReturnUrl && { errorReturnUrl: cleanErrorReturnUrl }),
      callbackVars
    }))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/access-token', async (req, res) => {
  const authToken = req.body.authToken;
  if (!authToken || authToken == '') {
    return res.status(400).json({ error: 'Invalid Auth Token' })
  }

  try {
    return res.status(200).json(await CamDigiKeyClient.default.getUserAccessToken(authToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/refresh-access-token', async (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken || accessToken =='') {
    return res.status(400).json({ error: 'Invalid Access Token' })
  }
  
  try {
    return res.status(200).json(await CamDigiKeyClient.default.refreshUserAccessToken(accessToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/logout-access-token', async (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken || accessToken =='') {
    return res.status(400).json({ error: 'Invalid Access Token' })
  }
  
  try {
    return res.status(200).json(await CamDigiKeyClient.default.logoutAccessToken(accessToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})


router.get('/organization-access-token', async (req, res) => {
  try {
    return res.status(200).json(await CamDigiKeyClient.default.getOrganizationAccessToken())
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/lookup-user-profile', async (req, res) => {
  const { accessToken, personalCode } = req.body
  if (!accessToken || accessToken =='') {
    return res.status(400).json({ error: 'Invalid Access Token' })
  }
  if (!personalCode || personalCode =='') {
    return res.status(400).json({ error: 'Invalid Personal Code' })
  }

  try {
    return res.status(200).json(await CamDigiKeyClient.default.lookupUserProfile(accessToken, personalCode))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/verify-user-profile', async (req, res) => {
  const accountToken = req.body.accountToken
  if (!accountToken || accountToken =='') {
    return res.status(400).json({ error: 'Invalid Account Token' })
  }

  try {
    return res.status(200).json(await CamDigiKeyClient.default.verifyAccountToken(accountToken))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
