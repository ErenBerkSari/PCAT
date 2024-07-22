const Photo = require('../models/Photo');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    fs.access(uploadDir, (err) => {
      if (err) {
        fs.mkdir(uploadDir, { recursive: true }, (err) => cb(err, uploadDir));
      } else {
        cb(null, uploadDir);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Multer upload configuration
const upload = multer({ storage });

exports.getAllPhotos = async (req, res) => {
  const page = req.query.page || 1;
  const photosPerPage = 1;
  const totalPhotos = await Photo.find().countDocuments();
  console.log(totalPhotos);
  const photos = await Photo.find({})
    .sort('-dateCreated')
    .skip((page - 1) * photosPerPage)
    .limit(photosPerPage);
  res.render('index', {
    photos: photos,
    current: page,
    pages: Math.ceil(totalPhotos / photosPerPage),
  });
  //   console.log(req.query);
  //   const photos = await Photo.find({}).sort('-dateCreated');
  //   res.render('index', { photos });
};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', { photo });
};

exports.createPhoto = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('Hiçbir dosya yüklü değil.');
      }

      // Veritabanına dosya bilgilerini kaydet
      try {
        await Photo.create({
          ...req.body,
          image: '/uploads/' + req.file.filename,
        });
        res.redirect('/');
      } catch (dbError) {
        console.error('Veritabanı hatası:', dbError);
        res.status(500).send('Veritabanı hatası.');
      }
    } catch (error) {
      console.error('Bir hata oluştu:', error);
      res.status(500).send('Sunucu hatası.');
    }
  },
];

exports.updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send('Fotoğraf bulunamadı');
    }
    photo.title = req.body.title;
    photo.description = req.body.description;
    await photo.save();
    res.redirect(`/photos/${req.params.id}`);
  } catch (error) {
    console.error('Güncelleme sırasında hata oluştu:', error);
    res.status(500).send('Sunucu hatası.');
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id });
    const deletedImage = path.join(__dirname, '../public', photo.image);
    fs.unlinkSync(deletedImage);
    await Photo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error('Silme sırasında hata oluştu:', error);
    res.status(500).send('Sunucu hatası.');
  }
};

exports.getAboutPage = (req, res) => {
  res.render('about');
};

exports.getAddPage = (req, res) => {
  res.render('add');
};

exports.getEditPage = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  res.render('edit', {
    photo,
  });
};
