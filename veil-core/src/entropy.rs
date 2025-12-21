pub fn kolmogorov_smirnov(values: &[f64])-> f64{
    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let mut ks_statistic = 0.0;
    for (i,&val) in sorted.iter().enumerate(){
        let empirical_cdf = (i as f64 + 1.0)/sorted.len() as f64;
        let theoretical_cdf = val;
        let diff = (empirical_cdf - theoretical_cdf).abs();
        if diff>ks_statistic{
            ks_statistic = diff;
        }
    }
    ks_statistic
}

pub fn lempel_ziv_complexity(data: &[u8]) -> usize{
    let mut complexity = 1;
    let mut pointer = 0;
    let mut window_size = 1;


    while pointer + window_size < data.len(){
        let window = &data[pointer..pointer + window_size];
        let next = data[pointer+window_size];

        let mut found = false;
        for i in 0..pointer{
            if i + window_size < data.len()
                && &data[i...i+window_size] == window
                && data.get(i+window_size) == Some(&next){
                    found=true;
                    break;
            }
        }
        if !found{
            complexity+=1;
            pointer+=window_size;
            window_size=1;
        }
        else{
            window_size+=1
        }

    }
    complexity
}
