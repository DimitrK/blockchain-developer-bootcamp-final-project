const serializeResponse = async (response) => {
  let serialized;
  const cloned = response.clone();
  try {
    return await response.json();
  } catch (e) {
    try {
      serialized = await cloned.text();
    } catch (err) {
      serialized = '';
    }
  }

  if (serialized === 'undefined') {
    return '';
  }

  return serialized;
};

export default serializeResponse;
