-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 30 nov. 2025 à 15:55
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `heart_monitor`
--

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `daily_stats`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `daily_stats` (
`date` date
,`avg_bpm` decimal(14,4)
,`min_bpm` int(11)
,`max_bpm` int(11)
,`readings_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Structure de la table `heart_data`
--

CREATE TABLE `heart_data` (
  `id` int(11) NOT NULL,
  `bpm_average` int(11) NOT NULL,
  `bpm_instant` float NOT NULL,
  `timestamp` datetime NOT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `worker_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `heart_data`
--

INSERT INTO `heart_data` (`id`, `bpm_average`, `bpm_instant`, `timestamp`, `patient_id`, `worker_name`) VALUES
(198, 72, 71, '2025-11-30 10:00:00', NULL, 'Worker_1'),
(199, 74, 73, '2025-11-30 10:00:10', NULL, 'Worker_1'),
(200, 73, 75, '2025-11-30 10:00:20', NULL, 'Worker_1'),
(201, 75, 74, '2025-11-30 10:00:30', NULL, 'Worker_1'),
(202, 76, 77, '2025-11-30 10:00:40', NULL, 'Worker_1'),
(203, 77, 78, '2025-11-30 10:00:50', NULL, 'Worker_1'),
(204, 78, 79, '2025-11-30 10:01:00', NULL, 'Worker_1'),
(205, 79, 80, '2025-11-30 10:01:10', NULL, 'Worker_1'),
(206, 80, 81, '2025-11-30 10:01:20', NULL, 'Worker_1'),
(207, 81, 82, '2025-11-30 10:01:30', NULL, 'Worker_1'),
(208, 68, 67, '2025-11-30 10:00:00', NULL, 'Worker_2'),
(209, 69, 70, '2025-11-30 10:00:10', NULL, 'Worker_2'),
(210, 71, 72, '2025-11-30 10:00:20', NULL, 'Worker_2'),
(211, 72, 73, '2025-11-30 10:00:30', NULL, 'Worker_2'),
(212, 73, 74, '2025-11-30 10:00:40', NULL, 'Worker_2'),
(213, 75, 76, '2025-11-30 10:00:50', NULL, 'Worker_2'),
(214, 76, 77, '2025-11-30 10:01:00', NULL, 'Worker_2'),
(215, 77, 78, '2025-11-30 10:01:10', NULL, 'Worker_2'),
(216, 78, 79, '2025-11-30 10:01:20', NULL, 'Worker_2'),
(217, 79, 80, '2025-11-30 10:01:30', NULL, 'Worker_2'),
(218, 95, 94, '2025-11-30 10:00:00', NULL, 'Worker_3'),
(219, 96, 97, '2025-11-30 10:00:10', NULL, 'Worker_3'),
(220, 98, 99, '2025-11-30 10:00:20', NULL, 'Worker_3'),
(221, 99, 100, '2025-11-30 10:00:30', NULL, 'Worker_3'),
(222, 100, 101, '2025-11-30 10:00:40', NULL, 'Worker_3'),
(223, 101, 102, '2025-11-30 10:00:50', NULL, 'Worker_3'),
(224, 102, 103, '2025-11-30 10:01:00', NULL, 'Worker_3'),
(225, 103, 104, '2025-11-30 10:01:10', NULL, 'Worker_3'),
(226, 104, 105, '2025-11-30 10:01:20', NULL, 'Worker_3'),
(227, 105, 104, '2025-11-30 10:01:30', NULL, 'Worker_3'),
(228, 115, 114, '2025-11-30 10:00:00', NULL, 'Worker_4'),
(229, 116, 117, '2025-11-30 10:00:10', NULL, 'Worker_4'),
(230, 118, 119, '2025-11-30 10:00:20', NULL, 'Worker_4'),
(231, 119, 120, '2025-11-30 10:00:30', NULL, 'Worker_4'),
(232, 120, 121, '2025-11-30 10:00:40', NULL, 'Worker_4'),
(233, 121, 122, '2025-11-30 10:00:50', NULL, 'Worker_4'),
(234, 122, 123, '2025-11-30 10:01:00', NULL, 'Worker_4'),
(235, 123, 124, '2025-11-30 10:01:10', NULL, 'Worker_4'),
(236, 124, 125, '2025-11-30 10:01:20', NULL, 'Worker_4'),
(237, 125, 124, '2025-11-30 10:01:30', NULL, 'Worker_4'),
(238, 82, 80, '2025-11-30 10:00:00', NULL, 'Worker_5'),
(239, 83, 85, '2025-11-30 10:00:10', NULL, 'Worker_5'),
(240, 84, 82, '2025-11-30 10:00:20', NULL, 'Worker_5'),
(241, 85, 87, '2025-11-30 10:00:30', NULL, 'Worker_5'),
(242, 86, 84, '2025-11-30 10:00:40', NULL, 'Worker_5'),
(243, 85, 83, '2025-11-30 10:00:50', NULL, 'Worker_5'),
(244, 84, 86, '2025-11-30 10:01:00', NULL, 'Worker_5'),
(245, 85, 84, '2025-11-30 10:01:10', NULL, 'Worker_5'),
(246, 86, 88, '2025-11-30 10:01:20', NULL, 'Worker_5'),
(247, 87, 85, '2025-11-30 10:01:30', NULL, 'Worker_5'),
(250, 75, 165, '2025-11-30 12:09:44', NULL, 'Worker_10'),
(251, 82, 70, '2025-11-30 12:09:53', NULL, 'Worker_10'),
(252, 107, 123, '2025-11-30 12:10:03', NULL, 'Worker_10'),
(253, 106, 66, '2025-11-30 12:10:13', NULL, 'Worker_10'),
(254, 92, 43, '2025-11-30 12:10:23', NULL, 'Worker_10'),
(255, 73, 69, '2025-11-30 12:10:33', NULL, 'Worker_10'),
(256, 73, 40, '2025-11-30 12:10:43', NULL, 'Worker_10'),
(257, 17, 173, '2025-11-30 13:42:02', NULL, 'Worker_10'),
(258, 86, 174, '2025-11-30 13:42:12', NULL, 'Worker_10'),
(271, 143, 123, '2025-11-30 13:44:22', NULL, 'Worker_10'),
(303, 89, 73, '2025-11-30 15:35:20', NULL, 'Worker_10'),
(304, 104, 102, '2025-11-30 15:35:30', NULL, 'Worker_10'),
(305, 109, 198, '2025-11-30 15:35:40', NULL, 'Worker_10'),
(306, 133, 185, '2025-11-30 15:35:50', NULL, 'Worker_10'),
(307, 146, 156, '2025-11-30 15:36:00', NULL, 'Worker_10'),
(308, 146, 156, '2025-11-30 15:36:10', NULL, 'Worker_10'),
(309, 146, 156, '2025-11-30 15:36:20', NULL, 'Worker_10'),
(310, 146, 156, '2025-11-30 15:36:30', NULL, 'Worker_10'),
(311, 141, 41, '2025-11-30 15:36:40', NULL, 'Worker_10'),
(312, 113, 78, '2025-11-30 15:36:50', NULL, 'Worker_10'),
(313, 99, 55, '2025-11-30 15:37:00', NULL, 'Worker_10'),
(314, 100, 45, '2025-11-30 15:37:10', NULL, 'Worker_10'),
(315, 100, 45, '2025-11-30 15:37:20', NULL, 'Worker_10'),
(316, 111, 74, '2025-11-30 15:37:30', NULL, 'Worker_10'),
(317, 112, 49, '2025-11-30 15:37:40', NULL, 'Worker_10'),
(318, 112, 49, '2025-11-30 15:37:50', NULL, 'Worker_10'),
(319, 112, 49, '2025-11-30 15:38:00', NULL, 'Worker_10'),
(320, 112, 49, '2025-11-30 15:38:10', NULL, 'Worker_10'),
(321, 116, 148, '2025-11-30 15:38:20', NULL, 'Worker_10'),
(322, 124, 129, '2025-11-30 15:38:30', NULL, 'Worker_10'),
(323, 121, 84, '2025-11-30 15:38:40', NULL, 'Worker_10'),
(324, 105, 48, '2025-11-30 15:38:50', NULL, 'Worker_10'),
(325, 107, 149, '2025-11-30 15:39:00', NULL, 'Worker_10'),
(326, 141, 141, '2025-11-30 15:39:10', NULL, 'Worker_10'),
(327, 153, 198, '2025-11-30 15:39:20', NULL, 'Worker_10'),
(328, 132, 149, '2025-11-30 15:39:30', NULL, 'Worker_10'),
(329, 131, 198, '2025-11-30 15:39:40', NULL, 'Worker_10'),
(330, 139, 198, '2025-11-30 15:39:50', NULL, 'Worker_10'),
(331, 154, 165, '2025-11-30 15:40:00', NULL, 'Worker_10'),
(332, 155, 198, '2025-11-30 15:40:10', NULL, 'Worker_10'),
(333, 165, 170, '2025-11-30 15:40:20', NULL, 'Worker_10'),
(334, 158, 156, '2025-11-30 15:40:30', NULL, 'Worker_10'),
(335, 159, 184, '2025-11-30 15:40:40', NULL, 'Worker_10'),
(336, 168, 199, '2025-11-30 15:40:50', NULL, 'Worker_10'),
(337, 160, 198, '2025-11-30 15:41:00', NULL, 'Worker_10'),
(338, 118, 46, '2025-11-30 15:41:10', NULL, 'Worker_10'),
(339, 103, 46, '2025-11-30 15:41:20', NULL, 'Worker_10'),
(340, 107, 156, '2025-11-30 15:41:30', NULL, 'Worker_10'),
(341, 86, 41, '2025-11-30 15:41:40', NULL, 'Worker_10'),
(342, 91, 148, '2025-11-30 15:41:50', NULL, 'Worker_10'),
(343, 91, 148, '2025-11-30 15:42:00', NULL, 'Worker_10'),
(344, 91, 148, '2025-11-30 15:42:10', NULL, 'Worker_10'),
(345, 91, 148, '2025-11-30 15:42:20', NULL, 'Worker_10'),
(346, 91, 148, '2025-11-30 15:42:30', NULL, 'Worker_10'),
(347, 119, 148, '2025-11-30 15:42:40', NULL, 'Worker_10'),
(348, 126, 70, '2025-11-30 15:42:50', NULL, 'Worker_10'),
(349, 135, 175, '2025-11-30 15:43:00', NULL, 'Worker_10'),
(350, 148, 173, '2025-11-30 15:43:10', NULL, 'Worker_10'),
(351, 158, 173, '2025-11-30 15:43:20', NULL, 'Worker_10'),
(352, 174, 147, '2025-11-30 15:43:30', NULL, 'Worker_10'),
(353, 178, 175, '2025-11-30 15:43:40', NULL, 'Worker_10'),
(354, 170, 173, '2025-11-30 15:43:50', NULL, 'Worker_10'),
(355, 159, 173, '2025-11-30 15:44:00', NULL, 'Worker_10'),
(356, 158, 198, '2025-11-30 15:44:10', NULL, 'Worker_10'),
(357, 171, 198, '2025-11-30 15:44:20', NULL, 'Worker_10'),
(358, 149, 185, '2025-11-30 15:44:30', NULL, 'Worker_10'),
(359, 123, 165, '2025-11-30 15:44:40', NULL, 'Worker_10');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `latest_machine_predictions`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `latest_machine_predictions` (
`id` int(11)
,`machine_id` varchar(50)
,`worker_name` varchar(50)
,`future_anomaly_6h` tinyint(1)
,`risk_probability` float
,`pred_future_anomaly_6h` tinyint(1)
,`accident_risk_proba` float
,`machine_failure_risk` float
,`worker_safety_risk` float
,`prediction_time` datetime
,`model_version` varchar(50)
,`confidence_score` float
,`machine_name` varchar(100)
,`machine_type` varchar(50)
,`line` varchar(50)
,`machine_status` enum('active','maintenance','offline')
);

-- --------------------------------------------------------

--
-- Structure de la table `machines`
--

CREATE TABLE `machines` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) NOT NULL,
  `machine_name` varchar(100) NOT NULL,
  `machine_type` varchar(50) DEFAULT NULL,
  `line` varchar(50) DEFAULT NULL,
  `status` enum('active','maintenance','offline') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `machines`
--

INSERT INTO `machines` (`id`, `machine_id`, `machine_name`, `machine_type`, `line`, `status`, `created_at`, `updated_at`) VALUES
(1, 'M1', 'Machine_1', 'Type_A', 'Line_1', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(2, 'M2', 'Machine_2', 'Type_B', 'Line_1', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(3, 'M3', 'Machine_3', 'Type_A', 'Line_2', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(4, 'M4', 'Machine_4', 'Type_C', 'Line_2', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(5, 'M5', 'Machine_5', 'Type_B', 'Line_3', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(6, 'M6', 'Machine_6', 'Type_A', 'Line_3', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(7, 'M7', 'Machine_7', 'Type_C', 'Line_1', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(8, 'M8', 'Machine_8', 'Type_B', 'Line_2', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(9, 'M9', 'Machine_9', 'Type_A', 'Line_3', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55'),
(10, 'M10', 'Machine_10', 'Type_C', 'Line_1', 'active', '2025-11-30 12:48:55', '2025-11-30 12:48:55');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `machine_complete_status`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `machine_complete_status` (
`machine_id` varchar(50)
,`machine_name` varchar(100)
,`machine_type` varchar(50)
,`line` varchar(50)
,`status` enum('active','maintenance','offline')
,`worker_name` varchar(50)
,`temperature_C` float
,`vibration_mm_s` float
,`pressure_bar` float
,`current_A` float
,`humidity_pct` float
,`ppe_violation` tinyint(1)
,`intrusion_alert` tinyint(1)
,`smoke_alert` tinyint(1)
,`detected_persons` int(11)
,`sensor_timestamp` datetime
,`future_anomaly_6h` tinyint(1)
,`risk_probability` float
,`pred_future_anomaly_6h` tinyint(1)
,`accident_risk_proba` float
,`machine_failure_risk` float
,`worker_safety_risk` float
,`prediction_time` datetime
,`confidence_score` float
,`alert_level` varchar(8)
);

-- --------------------------------------------------------

--
-- Structure de la table `machine_predictions`
--

CREATE TABLE `machine_predictions` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) NOT NULL,
  `worker_name` varchar(50) DEFAULT NULL,
  `future_anomaly_6h` tinyint(1) DEFAULT 0,
  `risk_probability` float DEFAULT NULL,
  `pred_future_anomaly_6h` tinyint(1) DEFAULT 0,
  `accident_risk_proba` float DEFAULT NULL,
  `machine_failure_risk` float DEFAULT NULL,
  `worker_safety_risk` float DEFAULT NULL,
  `prediction_time` datetime DEFAULT current_timestamp(),
  `model_version` varchar(50) DEFAULT NULL,
  `confidence_score` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `machine_predictions`
--

INSERT INTO `machine_predictions` (`id`, `machine_id`, `worker_name`, `future_anomaly_6h`, `risk_probability`, `pred_future_anomaly_6h`, `accident_risk_proba`, `machine_failure_risk`, `worker_safety_risk`, `prediction_time`, `model_version`, `confidence_score`) VALUES
(1, 'M1', 'Worker_1', 0, 0.15, 0, 0.08, 0.12, 0.1, '2025-11-30 12:48:55', 'v1.0', 0.92),
(2, 'M2', 'Worker_2', 0, 0.18, 0, 0.12, 0.15, 0.14, '2025-11-30 12:48:55', 'v1.0', 0.89),
(3, 'M3', 'Worker_3', 0, 0.22, 0, 0.16, 0.19, 0.18, '2025-11-30 12:48:55', 'v1.0', 0.87),
(4, 'M4', 'Worker_4', 0, 0.28, 0, 0.21, 0.25, 0.23, '2025-11-30 12:48:55', 'v1.0', 0.85),
(5, 'M5', 'Worker_5', 0, 0.19, 0, 0.14, 0.17, 0.15, '2025-11-30 12:48:55', 'v1.0', 0.9),
(6, 'M6', 'Worker_6', 1, 0.78, 1, 0.82, 0.75, 0.8, '2025-11-30 12:48:55', 'v1.0', 0.88),
(7, 'M7', 'Worker_7', 1, 0.85, 1, 0.89, 0.83, 0.87, '2025-11-30 12:48:55', 'v1.0', 0.91),
(8, 'M8', 'Worker_8', 1, 0.82, 1, 0.86, 0.79, 0.84, '2025-11-30 12:48:55', 'v1.0', 0.89),
(9, 'M9', 'Worker_9', 1, 0.92, 1, 0.95, 0.9, 0.94, '2025-11-30 12:48:55', 'v1.0', 0.94),
(10, 'M10', 'Worker_10', 1, 0.76, 1, 0.8, 0.73, 0.78, '2025-11-30 12:48:55', 'v1.0', 0.86),
(11, 'M1', 'Worker_1', 0, 0.225, 0, 0.225, 0.2025, 0.1575, '2025-11-30 13:04:27', 'preventec_v1.0', 0.775),
(12, 'M10', 'Worker_10', 0, 0.7875, 1, 1, 0.7088, 0.7166, '2025-11-30 13:04:27', 'preventec_v1.0', 0.7875),
(13, 'M2', 'Worker_2', 0, 0.2675, 0, 0.2675, 0.2408, 0.1872, '2025-11-30 13:04:27', 'preventec_v1.0', 0.7325),
(14, 'M3', 'Worker_3', 0, 0.285, 0, 0.285, 0.2565, 0.1995, '2025-11-30 13:04:27', 'preventec_v1.0', 0.715),
(15, 'M4', 'Worker_4', 0, 0.315, 0, 0.315, 0.2835, 0.2205, '2025-11-30 13:04:28', 'preventec_v1.0', 0.685),
(16, 'M5', 'Worker_5', 0, 0.29, 0, 0.29, 0.261, 0.203, '2025-11-30 13:04:28', 'preventec_v1.0', 0.71),
(17, 'M6', 'Worker_6', 0, 0.75, 1, 0.975, 0.675, 0.6825, '2025-11-30 13:04:28', 'preventec_v1.0', 0.75),
(18, 'M7', 'Worker_7', 0, 0.9975, 1, 1, 0.8978, 0.9077, '2025-11-30 13:04:28', 'preventec_v1.0', 0.9975),
(19, 'M8', 'Worker_8', 0, 0.6375, 1, 0.9562, 0.5738, 0.6694, '2025-11-30 13:04:28', 'preventec_v1.0', 0.6375),
(20, 'M9', 'Worker_9', 0, 0.9775, 1, 1, 0.8798, 1.0264, '2025-11-30 13:04:28', 'preventec_v1.0', 0.9775),
(21, 'M1', 'Worker_1', 0, 0.225, 0, 0.225, 0.2025, 0.1575, '2025-11-30 13:20:43', 'preventec_v1.0', 0.775),
(22, 'M10', 'Worker_10', 0, 0.7875, 1, 1, 0.7088, 0.7166, '2025-11-30 13:20:43', 'preventec_v1.0', 0.7875),
(23, 'M2', 'Worker_2', 0, 0.2675, 0, 0.2675, 0.2408, 0.1872, '2025-11-30 13:20:43', 'preventec_v1.0', 0.7325),
(24, 'M3', 'Worker_3', 0, 0.285, 0, 0.285, 0.2565, 0.1995, '2025-11-30 13:20:43', 'preventec_v1.0', 0.715),
(25, 'M4', 'Worker_4', 0, 0.315, 0, 0.315, 0.2835, 0.2205, '2025-11-30 13:20:43', 'preventec_v1.0', 0.685),
(26, 'M5', 'Worker_5', 0, 0.29, 0, 0.29, 0.261, 0.203, '2025-11-30 13:20:43', 'preventec_v1.0', 0.71),
(27, 'M6', 'Worker_6', 0, 0.75, 1, 0.975, 0.675, 0.6825, '2025-11-30 13:20:43', 'preventec_v1.0', 0.75),
(28, 'M7', 'Worker_7', 0, 0.9975, 1, 1, 0.8978, 0.9077, '2025-11-30 13:20:43', 'preventec_v1.0', 0.9975),
(29, 'M8', 'Worker_8', 0, 0.6375, 1, 0.9562, 0.5738, 0.6694, '2025-11-30 13:20:43', 'preventec_v1.0', 0.6375),
(30, 'M9', 'Worker_9', 0, 0.9775, 1, 1, 0.8798, 1.0264, '2025-11-30 13:20:44', 'preventec_v1.0', 0.9775);

-- --------------------------------------------------------

--
-- Structure de la table `machine_sensor_data`
--

CREATE TABLE `machine_sensor_data` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) NOT NULL,
  `worker_name` varchar(50) DEFAULT NULL,
  `camera_id` varchar(50) DEFAULT NULL,
  `detected_persons` int(11) DEFAULT 0,
  `ppe_violation` tinyint(1) DEFAULT 0,
  `intrusion_alert` tinyint(1) DEFAULT 0,
  `smoke_alert` tinyint(1) DEFAULT 0,
  `temperature_C` float DEFAULT NULL,
  `vibration_mm_s` float DEFAULT NULL,
  `pressure_bar` float DEFAULT NULL,
  `current_A` float DEFAULT NULL,
  `humidity_pct` float DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `machine_sensor_data`
--

INSERT INTO `machine_sensor_data` (`id`, `machine_id`, `worker_name`, `camera_id`, `detected_persons`, `ppe_violation`, `intrusion_alert`, `smoke_alert`, `temperature_C`, `vibration_mm_s`, `pressure_bar`, `current_A`, `humidity_pct`, `timestamp`) VALUES
(1, 'M1', 'Worker_1', 'Cam_1', 1, 0, 0, 0, 45.5, 2.1, 5.2, 8.3, 42.5, '2025-11-30 12:48:55'),
(2, 'M2', 'Worker_2', 'Cam_2', 1, 0, 0, 0, 48.2, 2.8, 5.8, 7.9, 45.2, '2025-11-30 12:48:55'),
(3, 'M3', 'Worker_3', 'Cam_1', 1, 0, 0, 0, 52.3, 3.2, 4.5, 9.1, 38.7, '2025-11-30 12:48:55'),
(4, 'M4', 'Worker_4', 'Cam_3', 2, 0, 0, 0, 55.8, 3.5, 6.1, 10.2, 51.3, '2025-11-30 12:48:55'),
(5, 'M5', 'Worker_5', 'Cam_2', 1, 0, 0, 0, 49.7, 2.5, 5.4, 8.7, 44.8, '2025-11-30 12:48:55'),
(6, 'M6', 'Worker_6', 'Cam_3', 2, 1, 0, 0, 78.5, 6.8, 3.2, 11.5, 68.5, '2025-11-30 12:48:55'),
(7, 'M7', 'Worker_7', 'Cam_1', 3, 1, 1, 0, 82.3, 7.2, 2.8, 12.8, 72.1, '2025-11-30 12:48:55'),
(8, 'M8', 'Worker_8', 'Cam_2', 1, 0, 0, 1, 85.7, 8.1, 4.1, 13.2, 55.9, '2025-11-30 12:48:55'),
(9, 'M9', 'Worker_9', 'Cam_3', 4, 1, 1, 1, 89.2, 8.9, 2.5, 14.5, 81.3, '2025-11-30 12:48:55'),
(10, 'M10', 'Worker_10', 'Cam_1', 2, 1, 0, 0, 76.8, 5.9, 5.7, 9.8, 62.4, '2025-11-30 12:48:55');

-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `device_id` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `worker_heart_stats`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `worker_heart_stats` (
`worker_name` varchar(50)
,`total_readings` bigint(21)
,`avg_bpm` decimal(14,4)
,`min_bpm` int(11)
,`max_bpm` int(11)
,`status` varchar(9)
,`last_update` datetime
);

-- --------------------------------------------------------

--
-- Structure de la vue `daily_stats`
--
DROP TABLE IF EXISTS `daily_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_stats`  AS SELECT cast(`heart_data`.`timestamp` as date) AS `date`, avg(`heart_data`.`bpm_average`) AS `avg_bpm`, min(`heart_data`.`bpm_average`) AS `min_bpm`, max(`heart_data`.`bpm_average`) AS `max_bpm`, count(0) AS `readings_count` FROM `heart_data` GROUP BY cast(`heart_data`.`timestamp` as date) ORDER BY cast(`heart_data`.`timestamp` as date) DESC ;

-- --------------------------------------------------------

--
-- Structure de la vue `latest_machine_predictions`
--
DROP TABLE IF EXISTS `latest_machine_predictions`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `latest_machine_predictions`  AS SELECT `mp`.`id` AS `id`, `mp`.`machine_id` AS `machine_id`, `mp`.`worker_name` AS `worker_name`, `mp`.`future_anomaly_6h` AS `future_anomaly_6h`, `mp`.`risk_probability` AS `risk_probability`, `mp`.`pred_future_anomaly_6h` AS `pred_future_anomaly_6h`, `mp`.`accident_risk_proba` AS `accident_risk_proba`, `mp`.`machine_failure_risk` AS `machine_failure_risk`, `mp`.`worker_safety_risk` AS `worker_safety_risk`, `mp`.`prediction_time` AS `prediction_time`, `mp`.`model_version` AS `model_version`, `mp`.`confidence_score` AS `confidence_score`, `m`.`machine_name` AS `machine_name`, `m`.`machine_type` AS `machine_type`, `m`.`line` AS `line`, `m`.`status` AS `machine_status` FROM ((`machine_predictions` `mp` join `machines` `m` on(`mp`.`machine_id` = `m`.`machine_id`)) join (select `machine_predictions`.`machine_id` AS `machine_id`,max(`machine_predictions`.`prediction_time`) AS `max_time` from `machine_predictions` group by `machine_predictions`.`machine_id`) `latest` on(`mp`.`machine_id` = `latest`.`machine_id` and `mp`.`prediction_time` = `latest`.`max_time`)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `machine_complete_status`
--
DROP TABLE IF EXISTS `machine_complete_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `machine_complete_status`  AS SELECT `m`.`machine_id` AS `machine_id`, `m`.`machine_name` AS `machine_name`, `m`.`machine_type` AS `machine_type`, `m`.`line` AS `line`, `m`.`status` AS `status`, `msd`.`worker_name` AS `worker_name`, `msd`.`temperature_C` AS `temperature_C`, `msd`.`vibration_mm_s` AS `vibration_mm_s`, `msd`.`pressure_bar` AS `pressure_bar`, `msd`.`current_A` AS `current_A`, `msd`.`humidity_pct` AS `humidity_pct`, `msd`.`ppe_violation` AS `ppe_violation`, `msd`.`intrusion_alert` AS `intrusion_alert`, `msd`.`smoke_alert` AS `smoke_alert`, `msd`.`detected_persons` AS `detected_persons`, `msd`.`timestamp` AS `sensor_timestamp`, `mp`.`future_anomaly_6h` AS `future_anomaly_6h`, `mp`.`risk_probability` AS `risk_probability`, `mp`.`pred_future_anomaly_6h` AS `pred_future_anomaly_6h`, `mp`.`accident_risk_proba` AS `accident_risk_proba`, `mp`.`machine_failure_risk` AS `machine_failure_risk`, `mp`.`worker_safety_risk` AS `worker_safety_risk`, `mp`.`prediction_time` AS `prediction_time`, `mp`.`confidence_score` AS `confidence_score`, CASE WHEN `mp`.`accident_risk_proba` > 0.8 OR `mp`.`pred_future_anomaly_6h` = 1 THEN 'critical' WHEN `mp`.`risk_probability` > 0.7 OR `mp`.`accident_risk_proba` > 0.6 THEN 'warning' ELSE 'normal' END AS `alert_level` FROM ((`machines` `m` left join (select `msd1`.`id` AS `id`,`msd1`.`machine_id` AS `machine_id`,`msd1`.`worker_name` AS `worker_name`,`msd1`.`camera_id` AS `camera_id`,`msd1`.`detected_persons` AS `detected_persons`,`msd1`.`ppe_violation` AS `ppe_violation`,`msd1`.`intrusion_alert` AS `intrusion_alert`,`msd1`.`smoke_alert` AS `smoke_alert`,`msd1`.`temperature_C` AS `temperature_C`,`msd1`.`vibration_mm_s` AS `vibration_mm_s`,`msd1`.`pressure_bar` AS `pressure_bar`,`msd1`.`current_A` AS `current_A`,`msd1`.`humidity_pct` AS `humidity_pct`,`msd1`.`timestamp` AS `timestamp` from `machine_sensor_data` `msd1` where (`msd1`.`machine_id`,`msd1`.`timestamp`) in (select `machine_sensor_data`.`machine_id`,max(`machine_sensor_data`.`timestamp`) from `machine_sensor_data` group by `machine_sensor_data`.`machine_id`)) `msd` on(`m`.`machine_id` collate utf8mb4_general_ci = `msd`.`machine_id` collate utf8mb4_general_ci)) left join (select `mp1`.`id` AS `id`,`mp1`.`machine_id` AS `machine_id`,`mp1`.`worker_name` AS `worker_name`,`mp1`.`future_anomaly_6h` AS `future_anomaly_6h`,`mp1`.`risk_probability` AS `risk_probability`,`mp1`.`pred_future_anomaly_6h` AS `pred_future_anomaly_6h`,`mp1`.`accident_risk_proba` AS `accident_risk_proba`,`mp1`.`machine_failure_risk` AS `machine_failure_risk`,`mp1`.`worker_safety_risk` AS `worker_safety_risk`,`mp1`.`prediction_time` AS `prediction_time`,`mp1`.`model_version` AS `model_version`,`mp1`.`confidence_score` AS `confidence_score` from `machine_predictions` `mp1` where (`mp1`.`machine_id`,`mp1`.`prediction_time`) in (select `machine_predictions`.`machine_id`,max(`machine_predictions`.`prediction_time`) from `machine_predictions` group by `machine_predictions`.`machine_id`)) `mp` on(`m`.`machine_id` collate utf8mb4_general_ci = `mp`.`machine_id` collate utf8mb4_general_ci)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `worker_heart_stats`
--
DROP TABLE IF EXISTS `worker_heart_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `worker_heart_stats`  AS SELECT `heart_data`.`worker_name` AS `worker_name`, count(0) AS `total_readings`, avg(`heart_data`.`bpm_average`) AS `avg_bpm`, min(`heart_data`.`bpm_average`) AS `min_bpm`, max(`heart_data`.`bpm_average`) AS `max_bpm`, CASE WHEN avg(`heart_data`.`bpm_average`) > 110 THEN 'CRITIQUE' WHEN avg(`heart_data`.`bpm_average`) > 95 THEN 'ATTENTION' ELSE 'NORMAL' END AS `status`, max(`heart_data`.`timestamp`) AS `last_update` FROM `heart_data` WHERE `heart_data`.`worker_name` is not null GROUP BY `heart_data`.`worker_name` ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `heart_data`
--
ALTER TABLE `heart_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `idx_worker_name` (`worker_name`);

--
-- Index pour la table `machines`
--
ALTER TABLE `machines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `machine_id` (`machine_id`),
  ADD KEY `idx_machine_id` (`machine_id`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `machine_predictions`
--
ALTER TABLE `machine_predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_machine_id` (`machine_id`),
  ADD KEY `idx_prediction_time` (`prediction_time`),
  ADD KEY `idx_risk_levels` (`risk_probability`,`accident_risk_proba`);

--
-- Index pour la table `machine_sensor_data`
--
ALTER TABLE `machine_sensor_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_machine_id` (`machine_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_worker` (`worker_name`);

--
-- Index pour la table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `heart_data`
--
ALTER TABLE `heart_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=360;

--
-- AUTO_INCREMENT pour la table `machines`
--
ALTER TABLE `machines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `machine_predictions`
--
ALTER TABLE `machine_predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `machine_sensor_data`
--
ALTER TABLE `machine_sensor_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `heart_data`
--
ALTER TABLE `heart_data`
  ADD CONSTRAINT `heart_data_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Contraintes pour la table `machine_predictions`
--
ALTER TABLE `machine_predictions`
  ADD CONSTRAINT `machine_predictions_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`machine_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `machine_sensor_data`
--
ALTER TABLE `machine_sensor_data`
  ADD CONSTRAINT `machine_sensor_data_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`machine_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
