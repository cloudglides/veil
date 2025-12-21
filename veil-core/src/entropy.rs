#[allow(dead_code)]
pub fn kolmogorov_smirnov(values: &[f64]) -> f64 {
    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let mut ks_statistic = 0.0;
    for (i, &val) in sorted.iter().enumerate() {
        let empirical_cdf = (i as f64 + 1.0) / sorted.len() as f64;
        let theoretical_cdf = val;
        let diff = (empirical_cdf - theoretical_cdf).abs();
        if diff > ks_statistic {
            ks_statistic = diff;
        }
    }
    ks_statistic
}

#[allow(dead_code)]
pub fn lempel_ziv_complexity(data: &[u8]) -> usize {
    let mut complexity = 1;
    let mut pointer = 0;
    let mut window_size = 1;

    while pointer + window_size < data.len() {
        let window = &data[pointer..pointer + window_size];
        let next = data[pointer + window_size];

        let mut found = false;
        for i in 0..pointer {
            if i + window_size < data.len()
                && &data[i..i + window_size] == window
                && data.get(i + window_size) == Some(&next)
            {
                found = true;
                break;
            }
        }
        if !found {
            complexity += 1;
            pointer += window_size;
            window_size = 1;
        } else {
            window_size += 1;
        }
    }
    complexity
}

#[allow(dead_code)]
pub fn spectral_entropy(samples: &[f64]) -> f64 {
    let n = samples.len();
    let mut real = vec![0.0; n];
    let mut imag = vec![0.0; n];

    for k in 0..n {
        for (n_idx, &sample) in samples.iter().enumerate() {
            let angle = -2.0 * std::f64::consts::PI * (k as f64) * (n_idx as f64) / (n as f64);
            real[k] += sample * angle.cos();
            imag[k] += sample * angle.sin();
        }
    }

    let mut power: Vec<f64> = real
        .iter()
        .zip(imag.iter())
        .map(|(r, i)| (r * r + i * i).sqrt())
        .collect();

    let total_power: f64 = power.iter().sum();

    let mut entropy = 0.0;
    for p in power.iter_mut() {
        if *p > 0.0 {
            *p /= total_power;
            entropy -= *p * p.log2();
        }
    }
    entropy
}

#[allow(dead_code)]
pub fn approximate_entropy(samples: &[f64], m: usize) -> f64 {
    fn count_matches(data: &[f64], m: usize) -> usize {
        let mut count = 0;
        for i in 0..=(data.len().saturating_sub(m)) {
            for j in (i + 1)..=(data.len().saturating_sub(m)) {
                let mut match_found = true;
                for k in 0..m {
                    if (data[i + k] - data[j + k]).abs() > 0.001 {
                        match_found = false;
                        break;
                    }
                }
                if match_found {
                    count += 1;
                }
            }
        }
        count
    }

    let c1 = (count_matches(samples, m) as f64 + 1.0) / (samples.len() as f64 - m as f64 + 1.0);
    let c2 = (count_matches(samples, m + 1) as f64 + 1.0) / (samples.len() as f64 - m as f64);
    (c1 / c2).ln()
}

#[allow(dead_code)]
pub fn sample_entropy(samples: &[f64], m: usize, r: f64) -> f64 {
    fn count_template_matches(data: &[f64], m: usize, r: f64) -> usize {
        let mut count = 0;
        for i in 0..=(data.len().saturating_sub(m)) {
            for j in (i + 1)..=(data.len().saturating_sub(m)) {
                let mut max_diff = 0.0;
                for k in 0..m {
                    let diff = (data[i + k] - data[j + k]).abs();
                    if diff > max_diff {
                        max_diff = diff;
                    }
                }
                if max_diff < r {
                    count += 1;
                }
            }
        }
        count
    }

    let c1 = count_template_matches(samples, m, r) as f64;
    let c2 = count_template_matches(samples, m + 1, r) as f64;

    if c2 > 0.0 { -(c1 / c2).ln() } else { 0.0 }
}
