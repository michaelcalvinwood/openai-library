const axios = require ("axios");
exports.getJWT = async (hostname, username, password) => {
    
        let request = {
            url: `https://${hostname}/wp-json/jwt-auth/v1/token`,
            method: "POST",
            withCredentials: false,
            headers: {
                'Content-Type': 'application/json',
                'Accept': "*/*"
            },
            data: {
                username,
                password
            }
        }

        let response;
        try {
            response = await axios(request);
        } catch (err) {
            console.error(err);
            return false;
        }

        return response.data;
}

exports.getTagId = async (hostname, username, password, tagName) => {
    console.log('getTagId', tagName);
   
    let request = {
        url: `https://${hostname}/wp-json/wp/v2/tags`,
        method: "GET",
        params: {
           slug: tagName.toLowerCase().replaceAll(' ', '-').trim()
        }
    }

    //console.log(request);

    let response;

    try {
        response = await axios(request);
    } catch (err) {
        console.error(err);
        return false;
    }

    let tags = response.data;

    /*
     * If the tag exists then return the id
     */
    if (tags.length) return tags[0].id;

    /*
     * If the tag does not exist then create it
     */

    const token  = await exports.getJWT(hostname, username, password);
    if (token === false) return false;

    request = {
        url: `https://${hostname}/wp-json/wp/v2/tags`,
        method: "POST",
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.token}`
        },
        data: {
            name: tagName,
            slug: tagName.toLowerCase().replaceAll(' ', '-').trim()
        }
    }

    //console.log(request);

    try {
        response = await axios(request);
    } catch (err) {
        console.error(err);
        return false;
    }

    //console.log(response.data);
  
    return Number(response.data.id);
}

exports.createPost = async (hostname, username, password, title, content, postType = 'posts', tagNames = [], suggestedTitles = [], status = 'draft') => {
    let token, request, response;

    postType = postType === 'post' ? 'posts' : postType;

    let tagIds = [];
    let test = tagNames.find(tag => tag === 'news');
    if (!test) tagNames.push('news');

    if (tagNames.length) {
        for (let i = 0; i < tagNames.length; ++i) {
            const tagId = await exports.getTagId (hostname, username, password, tagNames[i]);
            tagIds.push(tagId);
        }
    }

    token = await exports.getJWT(hostname, username, password);

    request = {
        url: `https://${hostname}/wp-json/wp/v2/${postType}`,
        method: "POST",
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.token}`
        },
        data: {
            title, content, status,
            author: 1
        }
    }

    console.log(request);

    if (suggestedTitles.length) {
        if (typeof request.data.acf === 'undefined') request.data.acf = {};
        request.data.acf.suggested_titles = suggestedTitles.join("\n") 
    }

    if (tagNames.length) request.data.tags = tagIds;

   // console.log(request);

    try {
        
        response = await axios(request);
        const postId = response.data.id;
    } catch (err) {
        console.error(err);
        return false;
    }

    return response.data.id;
}

