import models from '../models/index.js'; // Asegúrate de importar tu modelo Branch
const { Branch, Business, User, Reservation } = models;

export const getBranchesByBusinessId = async (req, res) => {
  //console.log(Branch);
  try {
    const { businessId } = req.params;

    // Buscar todas las sucursales que pertenezcan a la empresa con el businessId proporcionado
    const branches = await Branch.findAll({
      where: { businessId: businessId },
    });

    if (!branches || branches.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron sucursales para esta empresa.' });
    }

    res.status(200).json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las sucursales.' });
  }
};
