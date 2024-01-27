const express = require('express')
const router = express.Router()
const Post = require('../models/Post')

// Routes
router.get('/', async (req,res)=>{
    try {
        const locals = {
            title : "NodeJs Blog",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        let perPage = 5;
        let page = req.query.page || 1;
        let data = await Post.aggregate([{ $sort : {createdAt : 1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        res.render('index',{locals,
            data,
            current : page,
            nextPage : hasNextPage ? nextPage : null
        })
    } catch (error) {
        console.error(error);
    }
})

router.get('/post/:id', async (req,res)=>{
    try {
        
        let slug = req.params.id;
        const data = await Post.findById({_id : slug})
        
        const locals = {
            title : data.title,
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        
        res.render('post',{locals, data})
    } catch (error) {
        console.error(error);
    }
})

router.post('/search', async (req,res)=>{
    try {
        const locals = {
            title : "search",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")
        const data = await Post.find({
            $or:[
                { title : {$regex: new RegExp(searchNoSpecialChar, 'i')}},
                { body : {$regex: new RegExp(searchNoSpecialChar, 'i')}},
            ]
        })
        res.render('search',{locals, data})
    } catch (error) {
        console.error(error);
    }
})

router.get('/about',(req,res)=>{
    res.render('about')
})

// Insert Posts To DB for testing
// function insertPostData(){
//     Post.insertMany(
//         [
//             {
//                 title: "The Impact of Climate Change on Coastal Communities",
//                 body: "Climate change poses significant threats to coastal communities around the world. Rising sea levels, increased frequency of extreme weather events, and ocean acidification are just a few of the challenges these communities face. In this article, we explore the various ways climate change is affecting coastal regions and discuss potential adaptation and mitigation strategies."
//             },
//             {
//                 title: "Advancements in Artificial Intelligence and Healthcare",
//                 body: "Artificial intelligence (AI) is revolutionizing the healthcare industry by offering innovative solutions to complex problems. From predictive analytics to personalized treatment plans, AI has the potential to improve patient outcomes and reduce healthcare costs. This article examines the latest advancements in AI technology and their impact on healthcare delivery and patient care."
//             },
//             {
//                 title: "Exploring the Wonders of Space Exploration",
//                 body: "Space exploration has captured the imagination of humanity for centuries. From the first manned moon landing to the exploration of distant planets and galaxies, humans have pushed the boundaries of scientific discovery and technological innovation. Join us on a journey through space exploration as we uncover the mysteries of the universe and explore the potential for future space missions."
//             },
//             {
//                 title: "The Rise of Sustainable Fashion",
//                 body: "Sustainable fashion is gaining momentum as consumers become more conscious of the environmental and social impacts of the clothing industry. From eco-friendly materials to ethical manufacturing practices, sustainable fashion offers a more responsible approach to clothing production and consumption. In this article, we explore the growing trend of sustainable fashion and its implications for the future of the industry."
//             },
//             {
//                 title: "Understanding the Importance of Mental Health Awareness",
//                 body: "Mental health awareness is crucial for promoting well-being and reducing the stigma surrounding mental illness. With increasing rates of stress, anxiety, and depression worldwide, it's more important than ever to prioritize mental health education and support services. This article explores the significance of mental health awareness and the steps individuals and communities can take to foster a culture of understanding and acceptance."
//             },
//             {
//                 title: "The Role of Technology in Education",
//                 body: "Technology has transformed the way we teach and learn, offering new opportunities for collaboration, creativity, and personalized instruction. From online courses to interactive learning tools, technology has the power to revolutionize education and make learning more accessible to students around the world. Join us as we explore the role of technology in education and its potential to shape the future of learning."
//             },
//             {
//                 title: "Unlocking the Secrets of the Human Brain",
//                 body: "The human brain is one of the most complex and mysterious organs in the body, holding the key to understanding consciousness, memory, and emotion. Through advances in neuroscience and brain imaging technology, scientists are making remarkable discoveries about the structure and function of the brain. In this article, we delve into the latest research on the human brain and explore the implications for understanding cognition and treating neurological disorders."
//             },
//             {
//                 title: "The Power of Renewable Energy Sources",
//                 body: "Renewable energy sources such as solar, wind, and hydroelectric power offer sustainable alternatives to fossil fuels, helping to reduce greenhouse gas emissions and combat climate change. With advancements in technology and increasing investment in renewable energy infrastructure, the transition to clean energy is becoming more feasible and cost-effective. Join us as we explore the power of renewable energy sources and their potential to transform the global energy landscape."
//             },
//             {
//                 title: "Challenges and Opportunities in Remote Work",
//                 body: "The COVID-19 pandemic has accelerated the adoption of remote work, presenting both challenges and opportunities for employers and employees alike. While remote work offers flexibility and autonomy, it also raises concerns about work-life balance, communication, and collaboration. In this article, we examine the challenges and opportunities associated with remote work and discuss strategies for building a successful remote work environment."
//             },
//             {
//                 title: "The Future of Urban Mobility: Trends and Innovations",
//                 body: "Urban mobility is undergoing a transformation as cities seek to reduce congestion, improve air quality, and enhance transportation efficiency. From electric vehicles to ride-sharing platforms, innovative technologies are reshaping the way people move within urban environments. Join us as we explore the latest trends and innovations in urban mobility and discuss the potential implications for sustainable city planning and development."
//             }
//         ]
//     )
// }

// insertPostData()

module.exports = router